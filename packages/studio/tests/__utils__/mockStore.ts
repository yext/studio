import { StudioStore } from "../../src/store/models/StudioStore";
import useStudioStore from "../../src/store/useStudioStore";

export type MockStudioStore = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [P in keyof StudioStore]?: StudioStore[P] extends (...args: any) => any
    ? StudioStore[P]
    : Partial<StudioStore[P]>;
};

export default function mockStore(state: MockStudioStore) {
  useStudioStore.setState({
    ...useStudioStore.getState(),
    ...(state as StudioStore),
    fileMetadatas: {
      ...useStudioStore.getState().fileMetadatas,
      ...state.fileMetadatas,
    },
    siteSettings: {
      ...useStudioStore.getState().siteSettings,
      ...state.siteSettings,
    },
    pages: {
      ...useStudioStore.getState().pages,
      ...state.pages,
    },
    previousSave: {
      ...useStudioStore.getState().previousSave,
      ...state.previousSave,
    },
  });
}
