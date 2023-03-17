import { FunctionComponent, useCallback, useEffect, useRef } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  TypeGuards,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";

/**
 * Load all functional component methods correspond to the components
 * and modules use in the provided page state's component tree.
 */
export default function useImportedComponents(componentTree: ComponentState[]) {
  const [
    UUIDToFileMetadata,
    setUUIDToImportedComponent,
    UUIDToImportedComponent,
  ] = useStudioStore((store) => [
    store.fileMetadatas.UUIDToFileMetadata,
    store.fileMetadatas.setUUIDToImportedComponent,
    store.fileMetadatas.UUIDToImportedComponent,
  ]);

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
      newLoadedComponents: Record<string, ImportType>
    ) => {
      if (
        !TypeGuards.isStandardOrModuleComponentState(c) &&
        !TypeGuards.isRepeaterState(c)
      ) {
        return null;
      }
      const componentState = TypeGuards.isRepeaterState(c)
        ? c.repeatedComponent
        : c;

      const { metadataUUID, componentName } = componentState;
      const metadata: FileMetadata | undefined =
        UUIDToFileMetadata[metadataUUID];
      if (
        !metadata ||
        metadataUUID in UUIDToImportedComponentRef.current ||
        metadataUUID in newLoadedComponents
      ) {
        return null;
      } else if (
        c.kind === ComponentStateKind.Module &&
        metadata.kind === FileMetadataKind.Module
      ) {
        return metadata.componentTree.map((c) =>
          importComponent(c, newLoadedComponents)
        );
      }
      const importedModule = await import(/* @vite-ignore */ metadata.filepath);
      const functionComponent = getFunctionComponent(
        importedModule,
        componentName
      );
      if (functionComponent) {
        newLoadedComponents[metadataUUID] = functionComponent;
      }
    },
    [UUIDToFileMetadata]
  );

  useEffect(() => {
    const newLoadedComponents: Record<string, ImportType> = {};
    const componentImportPromises = componentTree.flatMap((c) =>
      importComponent(c, newLoadedComponents)
    );
    Promise.all(componentImportPromises).then(() => {
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
