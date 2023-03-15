import { StudioStore } from "./models/StudioStore";
import path from "path-browserify";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  FileMetadataKind,
  ModuleState,
} from "@yext/studio-plugin";
import { differenceWith, isEqual } from "lodash";
import { v4 } from "uuid";

export default function getCreateModuleAction(
  get: () => StudioStore
): StudioStore["createModule"] {
  function throwIfInvalidFilepath(filepath: string) {
    const modulesFolder = get().studioConfig.paths.modules;
    const moduleName = path.basename(filepath, ".tsx");
    if (!path.isAbsolute(filepath) || !filepath.startsWith(modulesFolder)) {
      throw new Error(
        `Error creating module: modulePath is invalid: "${path.relative(
          modulesFolder,
          filepath
        )}".`
      );
    } else if (moduleName.charAt(0) !== moduleName.charAt(0).toUpperCase()) {
      throw new Error(
        "Error creating module: Module names must start with an uppercase letter."
      );
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
        const newModuleState: ModuleState = {
          kind: ComponentStateKind.Module,
          componentName: path.basename(filepath, ".tsx"),
          uuid: moduleComponentUUID,
          props: {},
          metadataUUID,
          parentUUID: c.parentUUID,
        };
        return newModuleState;
      }
      return c;
    });
    get().actions.updateComponentTree(updatedPageComponentTree);
    get().pages.setActiveComponentUUID(moduleComponentUUID);
  }

  return (modulePath: string) => {
    if (!modulePath) {
      throw new Error("Error creating module: a modulePath is required.");
    }
    const modulesFolder = get().studioConfig.paths.modules;
    const filepath = path.join(modulesFolder, modulePath + ".tsx");
    throwIfInvalidFilepath(filepath);

    const componentTree = get().actions.getComponentTree() ?? [];
    const activeComponentState = get().actions.getActiveComponentState();
    if (!activeComponentState) {
      throw new Error("Tried to create module without active component.");
    }
    createModule(filepath, componentTree, activeComponentState);
  };
}
