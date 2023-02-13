import {
  FunctionComponent,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentState,
  ComponentStateKind,
  StandardComponentState,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";

/**
 * Load all functional component methods correspond to the components
 * and modules use in the provided page state's component tree.
 */
export default function useImportedComponents(componentTree: ComponentState[]) {
  const [
    setUUIDToImportedComponent,
    UUIDToImportedComponent,
    getModuleMetadata,
  ] = useStudioStore((store) => [
    store.fileMetadatas.setUUIDToImportedComponent,
    store.fileMetadatas.UUIDToImportedComponent,
    store.fileMetadatas.getModuleMetadata,
  ]);
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
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
      c: StandardComponentState,
      newImportedComponents: Record<string, ImportType>
    ) => {
      const { metadataUUID, componentName } = c;
      // Avoid re-importing components
      if (metadataUUID in UUIDToImportedComponentRef) {
        return null;
      }
      const metadata = UUIDToFileMetadata[metadataUUID];
      if (!metadata) {
        console.log(c, metadata, metadataUUID, UUIDToFileMetadata);
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
    [UUIDToFileMetadata]
  );

  useEffect(() => {
    const newLoadedComponents: Record<string, ImportType> = {};
    const importComponentState = (c: ComponentState) => {
      if (c.kind === ComponentStateKind.Standard) {
        return importComponent(c, newLoadedComponents);
      } else if (c.kind === ComponentStateKind.Module) {
        console.log(UUIDToFileMetadata, c);
        const moduleMetadata = getModuleMetadata(c.metadataUUID);
        return moduleMetadata.componentTree.flatMap(importComponentState);
      } else {
        return null;
      }
    };
    const importPromises = componentTree.flatMap(importComponentState);
    Promise.all(importPromises).then(() => {
      const newState = {
        ...UUIDToImportedComponentRef.current,
        ...newLoadedComponents,
      };
      UUIDToImportedComponentRef.current = newState;
      setUUIDToImportedComponent(newState);
    });
  }, [
    importComponent,
    componentTree,
    setUUIDToImportedComponent,
    getModuleMetadata,
    UUIDToFileMetadata,
  ]);
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
