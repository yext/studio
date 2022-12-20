import FileMetadataSlice from "../../src/store/models/slices/FileMetadataSlice";
import PageSlice from "../../src/store/models/slices/PageSlice";
import SiteSettingSlice from "../../src/store/models/slices/SiteSettingsSlice";
import useStudioStore from "../../src/store/useStudioStore";

export type MockStudioStore = Partial<{
  fileMetadatas: Partial<FileMetadataSlice>;
  pages: Partial<PageSlice>;
  siteSettings: Partial<SiteSettingSlice>;
}>;

export default function mockStore(state: MockStudioStore) {
  useStudioStore.setState({
    fileMetadatas: {
      ...useStudioStore.getState().fileMetadatas,
      ...(state.fileMetadatas ?? {}),
    },
    siteSettings: {
      ...useStudioStore.getState().siteSettings,
      ...(state.siteSettings ?? {}),
    },
    pages: {
      ...useStudioStore.getState().pages,
      ...(state.pages ?? {}),
    },
  });
}
