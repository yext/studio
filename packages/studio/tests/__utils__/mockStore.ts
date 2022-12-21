import { StudioStore } from "../../src/store/models/store";
import useStudioStore from "../../src/store/useStudioStore";

export type MockStudioStore = {
  [P in keyof StudioStore]?: Partial<StudioStore[P]>;
};

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
