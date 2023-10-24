import { create, StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

import { StudioStore } from "./models/StudioStore";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import createPagePreviewSlice from "./slices/createPagePreviewSlice";
import StudioActions from "./StudioActions";
import createStudioConfigSlice from "./slices/createStudioConfigSlice";
import createPreviousSaveSlice from "./slices/createPreviousSaveSlice";
import { addZundoMiddleware } from "./zundoMiddleware";
import createEnvDataSlice from "./slices/createEnvDataSlice";
import createGitDataSlice from "./slices/createGitDataSlice";
import createAccountContentSlice from "./slices/accountContent/createAccountContentSlice";
import createLayoutSlice from "./slices/createLayoutSlice";
import createLoadedStylesSlice from "./slices/createLoadedStylesSlice";

enableMapSet();

/**
 * Middlewares used for the Studio store, specifically immer and Zundo.
 */
function storeMiddlewares(
  storeCreator: StateCreator<StudioStore, [["zustand/immer", never]]>
) {
  return addZundoMiddleware(immer(storeCreator));
}

/**
 * Studio's state manager in form of a hook to access and update states.
 */
const useStudioStore = create<StudioStore>()(
  storeMiddlewares(
    withLenses((set, get) => {
      return {
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        layouts: lens(createLayoutSlice),
        siteSettings: lens(createSiteSettingSlice),
        pagePreview: lens(createPagePreviewSlice),
        previousSave: lens(createPreviousSaveSlice),
        actions: new StudioActions(
          () => get().pages,
          () => get().fileMetadatas,
          () => get().siteSettings,
          () => get().previousSave,
          () => get().studioConfig
        ),
        studioConfig: lens(createStudioConfigSlice),
        envData: lens(createEnvDataSlice),
        gitData: lens(createGitDataSlice),
        accountContent: lens(createAccountContentSlice),
        loadedStyles: lens(createLoadedStylesSlice),
      };
    })
  )
);

void useStudioStore.getState().actions.refreshActivePageEntities();
// TODO: Once we know how the user's API key will be sourced, consider updating
// this to check for the presence of the API key
useStudioStore.getState().studioConfig.isPagesJSRepo &&
  void useStudioStore.getState().accountContent.refreshBaseAccountContent();

export type UseStudioStore = typeof useStudioStore;
export default useStudioStore;
