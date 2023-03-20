import { StudioStore } from "./models/StudioStore";
import path from "path-browserify";
import {
  ComponentState,
  ComponentTreeHelpers,
  FileMetadataKind,
  ModuleMetadata,
  PropValueType,
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

  function createModuleMetadata(
    filepath: string,
    descendants: ComponentState[],
    activeComponentState: ComponentState
  ): ModuleMetadata {
    const moduleMetadata: ModuleMetadata = {
      kind: FileMetadataKind.Module,
      componentTree: [
        { ...activeComponentState, parentUUID: undefined },
        ...descendants,
      ],
      metadataUUID: v4(),
      filepath,
      propShape: {},
    };
    if (get().studioConfig.isPagesJSRepo) {
      moduleMetadata.propShape = {
        document: {
          type: PropValueType.Record,
          recordKey: "string",
          recordValue: "any",
          required: true,
        },
      };
    }
    return moduleMetadata;
  }

  function createModule(
    filepath: string,
    componentTree: ComponentState[],
    activeComponentState: ComponentState
  ) {
    const descendants = ComponentTreeHelpers.getDescendants(
      activeComponentState,
      componentTree
    );
    const moduleMetadata: ModuleMetadata = createModuleMetadata(
      filepath,
      descendants,
      activeComponentState
    );
    get().fileMetadatas.setFileMetadata(
      moduleMetadata.metadataUUID,
      moduleMetadata
    );
    const moduleState = get().actions.createComponentState(moduleMetadata);
    const updatedPageComponentTree: ComponentState[] = differenceWith(
      componentTree,
      descendants,
      isEqual
    ).map((c) => {
      if (c.uuid === activeComponentState.uuid) {
        return {
          ...moduleState,
          parentUUID: c.parentUUID,
        };
      }
      return c;
    });
    get().actions.updateComponentTree(updatedPageComponentTree);
    get().pages.setActiveComponentUUID(moduleState.uuid);
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
