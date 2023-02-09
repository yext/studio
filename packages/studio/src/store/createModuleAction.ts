import { StudioStore } from "./models/StudioStore";
import path from "path-browserify";
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
  function throwIfInvalidFilepath(moduleName: string, filepath: string) {
    if (!moduleName) {
      throw new Error("Error creating module: a moduleName is required.");
    }
    const modulesPath = get().studioConfig.paths.modules;
    if (!path.isAbsolute(filepath) || !filepath.startsWith(modulesPath)) {
      throw new Error(
        `Error creating module: moduleName is invalid: "${moduleName}".`
      );
    } else if (moduleName.charAt(0) !== moduleName.charAt(0).toUpperCase()) {
      throw new Error("Module names must start with an uppercase letter.");
    } else if (
      Object.values(get().fileMetadatas.UUIDToFileMetadata).some(
        (fileMetadata) =>
          path.basename(fileMetadata.filepath, ".tsx") === moduleName
      )
    ) {
      throw new Error(
        `Error creating module: module name "${moduleName}" is already used.`
      );
    }
  }

  function createModule(
    moduleName: string,
    filepath: string,
    componentTree: ComponentState[],
    activeComponentState: ComponentState
  ) {
    const metadataUUID = v4();
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
          componentName: moduleName,
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

  return (moduleName: string) => {
    const modulesPath = get().studioConfig.paths.modules;
    const filepath = path.join(modulesPath, moduleName + ".tsx");
    const componentTree = get().actions.getComponentTree() ?? [];
    const activeComponentState = get().actions.getActiveComponentState();
    if (!activeComponentState) {
      throw new Error("Tried to create module without active component.");
    }
    throwIfInvalidFilepath(moduleName, filepath);
    createModule(moduleName, filepath, componentTree, activeComponentState);
  };
}
