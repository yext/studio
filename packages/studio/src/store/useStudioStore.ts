import { create, StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";

import { StudioStore } from "./models/StudioStore";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/pages/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import createPagePreviewSlice from "./slices/createPagePreviewSlice";
import getCreateModuleAction from "./createModuleAction";
import StudioActions from "./StudioActions";
import createStudioConfigSlice from "./slices/createStudioConfigSlice";
import createPreviousSaveSlice from "./slices/createPreviousSaveSlice";
import { addZundoMiddleware } from "./zundoMiddleware";
import createStudioEnvDataSlice from "./slices/createStudioEnvDataSlice";
import createAccountContentSlice from "./slices/createAccountContentSlice";

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
        siteSettings: lens(createSiteSettingSlice),
        pagePreview: lens(createPagePreviewSlice),
        createModule: getCreateModuleAction(get),
        previousSave: lens(createPreviousSaveSlice),
        actions: new StudioActions(
          () => get().pages,
          () => get().fileMetadatas,
          () => get().siteSettings,
          () => get().previousSave,
          () => get().studioConfig
        ),
        studioConfig: lens(createStudioConfigSlice),
        studioEnvData: lens(createStudioEnvDataSlice),
        accountContent: lens(createAccountContentSlice),
      };
    })
  )
);

void useStudioStore.getState().actions.refreshActivePageEntities();
void useStudioStore.getState().accountContent.initialize();

export type UseStudioStore = typeof useStudioStore;
export default useStudioStore;
