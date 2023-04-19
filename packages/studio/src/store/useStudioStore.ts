import { create, StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual } from "lodash";

import { StudioStore } from "./models/StudioStore";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/pages/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getUserUpdatableStore } from "./utils";
import { MessageID } from "@yext/studio-plugin";
import registerMessageListener from "../messaging/registerMessageListener";
import getCreateModuleAction from "./createModuleAction";
import StudioActions from "./StudioActions";
import createStudioConfigSlice from "./slices/createStudioConfigSlice";
import createPreviousSaveSlice from "./slices/createPreviousSaveSlice";
import setInitialAsyncState from "./setInitialEntityFile";

enableMapSet();

/**
 * Middlewares used for the Studio store, specifically immer and Zundo.
 */
function storeMiddlewares(
  storeCreator: StateCreator<StudioStore, [["zustand/immer", never]]>
): ReturnType<typeof temporal<StudioStore, [], [["zustand/immer", never]]>> {
  return temporal(immer(storeCreator), {
    equality: (currStore, pastStore) =>
      isEqual(
        getUserUpdatableStore(currStore),
        getUserUpdatableStore(pastStore)
      ),
    handleSet: (handleSet) => throttle(handleSet, 500),
  });
}

/**
 * Studio's state manager in form of a hook to access and update states.
 */
const useStudioStore = create<StudioStore>()(
  storeMiddlewares(
    withLenses((set, get) => {
      registerMessageListener(MessageID.SaveChanges, (payload) => {
        if (payload.type === "success") {
          set((s) => {
            s.pages.pendingChanges = {
              pagesToRemove: new Set<string>(),
              pagesToUpdate: new Set<string>(),
            };
          });
        }
      });

      return {
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        siteSettings: lens(createSiteSettingSlice),
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
      };
    })
  )
);

void setInitialAsyncState(useStudioStore);

export type UseStudioStore = typeof useStudioStore;
export default useStudioStore;
