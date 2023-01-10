import InputModal from "./common/InputModal";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import useStudioStore from "../store/useStudioStore";
import { useCallback, useState } from "react";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  FileMetadataKind,
  PageState,
} from "@yext/studio-plugin";
import { v4 } from "uuid";
import { differenceWith, isEqual } from "lodash";

/**
 * Renders a button for creating a module.
 */
export default function CreateModuleButton(): JSX.Element | null {
  const [
    UUIDToFileMetadata,
    setFileMetadata,
    getActivePageState,
    setActivePageState,
    getActiveComponentState,
    setActiveComponentUUID,
  ] = useStudioStore((store) => [
    store.fileMetadatas.UUIDToFileMetadata,
    store.fileMetadatas.setFileMetadata,
    store.pages.getActivePageState,
    store.pages.setActivePageState,
    store.pages.getActiveComponentState,
    store.pages.setActiveComponentUUID,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Invalid module name."
  );

  const createModule = useCallback(
    (
      filepath: string,
      activePageState: PageState,
      activeComponentState: ComponentState
    ) => {
      const metadataUUID = filepath;
      const childComponentTree = ComponentTreeHelpers.mapComponentTree<
        ComponentState[]
      >(
        activePageState.componentTree,
        (componentState, mappedChildren) => [
          componentState,
          ...mappedChildren.flat(),
        ],
        activeComponentState
      ).flat();
      setFileMetadata(metadataUUID, {
        kind: FileMetadataKind.Module,
        componentTree: [
          { ...activeComponentState, parentUUID: undefined },
          ...childComponentTree,
        ],
        metadataUUID,
        filepath,
      });
      const moduleComponentUUID = v4();
      const updatedPageComponentTree = differenceWith(
        activePageState.componentTree,
        childComponentTree,
        isEqual
      ).map((c) => {
        if (c.uuid === activeComponentState.uuid) {
          return {
            kind: ComponentStateKind.Module,
            componentName: path.basename(filepath, ".tsx"),
            uuid: moduleComponentUUID,
            props: {},
            metadataUUID,
            parentUUID: c.parentUUID,
          };
        }
        return c;
      });
      setActivePageState({
        ...activePageState,
        componentTree: updatedPageComponentTree,
      });
      setActiveComponentUUID(moduleComponentUUID);
    },
    [setFileMetadata, setActivePageState, setActiveComponentUUID]
  );

  const handleModalSave = useCallback(
    (moduleName: string) => {
      const activePageState = getActivePageState();
      if (!activePageState) {
        throw new Error("Tried to create module without active page.");
      }
      const activeComponentState = getActiveComponentState();
      if (!activeComponentState) {
        throw new Error("Tried to create module without active component.");
      }

      const modulesPath = initialStudioData.userPaths.modules;
      const filepath = path.join(modulesPath, moduleName + ".tsx");
      if (!path.isAbsolute(filepath) || !filepath.startsWith(modulesPath)) {
        setErrorMessage("Module path is invalid.");
        return false;
      }
      if (
        Object.values(UUIDToFileMetadata).some(
          (fileMetadata) =>
            path.basename(fileMetadata.filepath, ".tsx") ===
            path.basename(filepath, ".tsx")
        )
      ) {
        setErrorMessage("Module name already used.");
        return false;
      }
      createModule(filepath, activePageState, activeComponentState);
      return true;
    },
    [
      setErrorMessage,
      UUIDToFileMetadata,
      getActivePageState,
      getActiveComponentState,
      createModule,
    ]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <InputModal
          isOpen={isOpen}
          title="Create Module"
          description="Give the module a name:"
          errorMessage={errorMessage}
          handleClose={handleClose}
          handleSave={handleModalSave}
        />
      );
    },
    [errorMessage, handleModalSave]
  );

  const activeComponentState = getActiveComponentState();
  if (
    !activeComponentState ||
    activeComponentState.kind === ComponentStateKind.Module
  ) {
    return null;
  }

  return (
    <ButtonWithModal
      buttonContent="Create Module"
      buttonClassName="ml-4 py-1 px-3 text-white rounded-md bg-blue-600"
      renderModal={renderModal}
    />
  );
}
