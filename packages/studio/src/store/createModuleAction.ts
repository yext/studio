import { StudioStore } from "./models/StudioStore";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  FileMetadataKind,
} from "@yext/studio-plugin";
import { differenceWith, isEqual } from "lodash";
import { v4 } from "uuid";

export default function getCreateModuleAction(
  get: () => StudioStore
): StudioStore["createModule"] {
  function isValidFilepath(filepath: string): boolean {
    if (!filepath) {
      console.error("Error creating module: a filepath is required.");
      return false;
    }
    const modulesPath = initialStudioData.userPaths.modules;
    if (!path.isAbsolute(filepath) || !filepath.startsWith(modulesPath)) {
      console.error(`Error creating module: filepath is invalid: ${filepath}`);
      return false;
    }
    const moduleName = path.basename(filepath, ".tsx");
    if (
      Object.values(get().fileMetadatas.UUIDToFileMetadata).some(
        (fileMetadata) =>
          path.basename(fileMetadata.filepath, ".tsx") === moduleName
      )
    ) {
      console.error(
        `Error creating module: module name "${moduleName}" is already used.`
      );
      return false;
    }
    return true;
  }

  function createModule(
    filepath: string,
    componentTree: ComponentState[],
    activeComponentState: ComponentState
  ) {
    const metadataUUID = filepath;
    const childComponentTree = ComponentTreeHelpers.mapComponentTree<
      ComponentState[]
    >(
      componentTree,
      (componentState, mappedChildren) => [
        componentState,
        ...mappedChildren.flat(),
      ],
      activeComponentState
    ).flat();
    get().fileMetadatas.setFileMetadata(metadataUUID, {
      kind: FileMetadataKind.Module,
      componentTree: [
        { ...activeComponentState, parentUUID: undefined },
        ...childComponentTree,
      ],
      metadataUUID,
      filepath,
      propShape: {},
    });
    const moduleComponentUUID = v4();
    const updatedPageComponentTree = differenceWith(
      componentTree,
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
    get().actions.updateComponentTree(updatedPageComponentTree);
    get().pages.setActiveComponentUUID(moduleComponentUUID);
  }

  return (filepath: string) => {
    const componentTree = get().actions.getComponentTree() ?? [];
    const activeComponentState = get().actions.getActiveComponentState();
    if (!activeComponentState) {
      console.error("Tried to create module without active component.");
      return false;
    }
    if (!isValidFilepath(filepath)) {
      return false;
    }
    createModule(filepath, componentTree, activeComponentState);
    return true;
  };
}
