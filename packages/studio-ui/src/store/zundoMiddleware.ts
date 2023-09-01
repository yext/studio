import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import SiteSettingSlice from "./models/slices/SiteSettingsSlice";
import { StudioStore } from "./models/StudioStore";
import { isEqual } from "lodash";
import { ZundoOptions, temporal } from "zundo";
import { TemporalStudioStore } from "./useTemporalStore";
import { StateCreator } from "zustand";

type UserUpdatableStore = {
  siteSettings: Pick<SiteSettingSlice, "values">;
  fileMetadatas: Pick<FileMetadataSlice, "UUIDToFileMetadata">;
  pages: Pick<
    PageSlice,
    "pages" | "activePageName" | "activeComponentUUID" | "moduleUUIDBeingEdited"
  >;
};

/**
 * Gets the part of the Studio store that a user can directly update through
 * the UI. In other words, it leaves out the parts of state that are only
 * indirectly modified by Studio components, such as the mapping of imported
 * components and the {@link PreviousSaveSlice}.
 */
function getUserUpdatableStore(store: StudioStore): UserUpdatableStore {
  const { values } = store.siteSettings;
  const { UUIDToFileMetadata } = store.fileMetadatas;
  const { pages, activePageName, activeComponentUUID, moduleUUIDBeingEdited } =
    store.pages;
  return {
    siteSettings: {
      values,
    },
    fileMetadatas: {
      UUIDToFileMetadata,
    },
    pages: {
      pages,
      activePageName,
      activeComponentUUID,
      moduleUUIDBeingEdited,
    },
  };
}

const zundoOptions: ZundoOptions<StudioStore, TemporalStudioStore> = {
  equality: (currStore, pastStore) =>
    isEqual(getUserUpdatableStore(currStore), getUserUpdatableStore(pastStore)),
  partialize: (state) => {
    const { previousSave: _, ...remainingState } = state;
    return remainingState;
  },
};

export function addZundoMiddleware(
  storeCreator: StateCreator<StudioStore, [], [["zustand/immer", never]]>
): ReturnType<
  typeof temporal<
    StudioStore,
    [],
    [["zustand/immer", never]],
    TemporalStudioStore
  >
> {
  return temporal(storeCreator, zundoOptions);
}
