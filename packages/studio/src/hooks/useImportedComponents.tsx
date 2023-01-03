import { FunctionComponent, useCallback, useRef } from "react";
import useStudioStore from "../store/useStudioStore";
import { ComponentState, PageState, TypeGuards } from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";

/**
 * Load all functional component methods correspond to the components
 * and modules use in the provided page state's component tree.
 */
export default function useImportedComponents(pageState: PageState) {
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  const setUUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.setUUIDToImportedComponent
  );
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );

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
      const filepath = UUIDToFileMetadata[metadataUUID].filepath;
      const importedModule = await import(/* @vite-ignore */filepath);
      const functionComponent = getFunctionComponent(
        importedModule,
        componentName
      );
      if (functionComponent) {
        newImportedComponents[metadataUUID] = functionComponent;
      }
    },
    [UUIDToFileMetadata]
  );

  useLayoutEffect(() => {
    const newLoadedComponents: Record<string, ImportType> = {};
    Promise.all([
      ...pageState.componentTree.map((c) =>
        importComponent(c, newLoadedComponents)
      ),
    ]).then(() => {
      const newState = {
        ...UUIDToImportedComponentRef.current,
        ...newLoadedComponents,
      };
      UUIDToImportedComponentRef.current = newState;
      setUUIDToImportedComponent(newState);
    });
  }, [importComponent, pageState, setUUIDToImportedComponent]);
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
