import { StudioStore } from "./models/store";
import {
  ComponentState,
  ComponentStateKind,
  ComponentTreeHelpers,
  ModuleMetadata,
} from "@yext/studio-plugin";
import { v4 } from "uuid";
import { PagesRecord } from './models/slices/PageSlice';

/**
 * getDeleteModuleAction is a factory method for the deleteModule action.
 */
export default function getDeleteModuleAction(
  get: () => StudioStore
): StudioStore["deleteModule"] {
  return (metadata: ModuleMetadata) => {
    const pagesSlice = get().pages;

    pagesSlice.setActiveComponentUUID(undefined);
    const updatedPages: PagesRecord = Object.keys(pagesSlice.pages).reduce((allPages, pageName) => {
      allPages[pageName] = detachModuleInstances(metadata, pagesSlice.pages[pageName].componentTree);
      return allPages;
    }, {});
    pagesSlice.setPagesRecord(updatedPages);

    get().fileMetadatas.removeFileMetadata(metadata.metadataUUID);
  };
}

/**
 * Loops through the given componentTree, and detaches all modules that are instances
 * of the passed in ModuleMetadata.
 */
function detachModuleInstances(
  metadata: ModuleMetadata,
  componentTree: ComponentState[]
) {
  return componentTree.flatMap((componentStateToDetach) => {
    const isModule = componentStateToDetach.kind === ComponentStateKind.Module;
    if (
      !isModule ||
      componentStateToDetach.metadataUUID !== metadata.metadataUUID
    ) {
      return componentStateToDetach;
    }
    const detachedTree =
      ComponentTreeHelpers.mapComponentTreeParentsFirst<ComponentState>(
        metadata.componentTree,
        (child, parentValue) => {
          return {
            ...child,
            uuid: v4(),
            parentUUID: parentValue?.uuid ?? componentStateToDetach.parentUUID,
          };
        }
      );
    return detachedTree;
  });
}
