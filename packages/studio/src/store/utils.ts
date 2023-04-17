import FileMetadataSlice from "./models/slices/FileMetadataSlice";
import PageSlice from "./models/slices/PageSlice";
import SiteSettingSlice from "./models/slices/SiteSettingsSlice";
import { StudioStore } from "./models/StudioStore";

type UserUpdatableStore = {
  siteSettings: Pick<SiteSettingSlice, "shape" | "values">;
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
export function getUserUpdatableStore(store: StudioStore): UserUpdatableStore {
  const { shape, values } = store.siteSettings;
  const { UUIDToFileMetadata } = store.fileMetadatas;
  const { pages, activePageName, activeComponentUUID, moduleUUIDBeingEdited } =
    store.pages;
  return {
    siteSettings: {
      shape,
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
