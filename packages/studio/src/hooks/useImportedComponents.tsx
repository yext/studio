import { FunctionComponent, useCallback, useRef } from "react";
import useStudioStore from "../store/useStudioStore";
import { ComponentState, TypeGuards } from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";

/**
 * Load all functional component methods correspond to the components
 * and modules use in the provided page state's component tree.
 */
export default function useImportedComponents(componentTree: ComponentState[]) {
  const [
    setUUIDToImportedComponent,
    UUIDToImportedComponent,
    modulesToUpdate,
  ] = useStudioStore((store) => [
    store.fileMetadatas.setUUIDToImportedComponent,
    store.fileMetadatas.UUIDToImportedComponent,
    store.fileMetadatas.pendingChanges.modulesToUpdate,
  ]);
  const UUIDToFileMetadata = useStudioStore(store => store.fileMetadatas.UUIDToFileMetadata)

  // Use ref instead of to avoid triggering rerender (infinite loop)
  // when UUIDToImportedComponent is updated within this hook.
  const UUIDToImportedComponentRef = useRef<Record<string, ImportType>>(
    UUIDToImportedComponent
  );

  // Update ref when UUIDToImportedComponent is updated outside of this hook
  useLayoutEffect(() => {
    UUIDToImportedComponentRef.current = UUIDToImportedComponent;
  }, [UUIDToImportedComponent]);

  const importComponent = useCallback(
    async (
      c: ComponentState,
      newImportedComponents: Record<string, ImportType>
    ) => {
      if (!TypeGuards.isStandardOrModuleComponentState(c)) {
        return null;
      }
      const { metadataUUID, componentName } = c;
      // Avoid re-importing components
      if (metadataUUID in UUIDToImportedComponentRef) {
        return null;
      }
      const metadata = UUIDToFileMetadata[metadataUUID]
      if (!metadata) {
        console.log(c, metadata, metadataUUID, UUIDToFileMetadata)
      }
      const filepath = metadata.filepath;
      const importedModule = await import(/* @vite-ignore */ filepath);
      const functionComponent = getFunctionComponent(
        importedModule,
        componentName
      );
      if (functionComponent) {
        newImportedComponents[metadataUUID] = functionComponent;
      }
    },
    [UUIDToFileMetadata, modulesToUpdate]
  );

  useLayoutEffect(() => {
    const newLoadedComponents: Record<string, ImportType> = {};
    Promise.all([
      ...componentTree.map((c) => importComponent(c, newLoadedComponents)),
    ]).then(() => {
      const newState = {
        ...UUIDToImportedComponentRef.current,
        ...newLoadedComponents,
      };
      UUIDToImportedComponentRef.current = newState;
      setUUIDToImportedComponent(newState);
    });
  }, [importComponent, componentTree, setUUIDToImportedComponent]);
}

function getFunctionComponent(
  module: Record<string, unknown>,
  name: string
): ImportType | null {
  if (typeof module[name] === "function") {
    return module[name] as FunctionComponent;
  } else if (typeof module["default"] === "function") {
    return module["default"] as FunctionComponent;
  } else {
    console.error(`${name} is not a valid functional component.`);
    return null;
  }
}
