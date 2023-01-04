import create, { StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual } from "lodash";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getUserUpdatableStore } from "./utils";
import sendMessage from "../messaging/sendMessage";
import { MessageID } from "@yext/studio-plugin";
import registerMessageListener from "../messaging/registerMessageListener";

enableMapSet();

/**
 * Middlewares used for the Studio store, specifically immer and Zundo.
 */
function storeMiddlewares(
  storeCreator: StateCreator<StudioStore>
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
    withLenses((_set, get) => {
      registerMessageListener(MessageID.StudioCommitChanges, (payload) => {
        if (payload.type === 'success') {
          get().pages.resetPendingChanges()
        }
      })
      return ({
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        siteSettings: lens(createSiteSettingSlice),
        commitChanges: () => {
          const { pages, pendingChanges } = get().pages
          const { pagesToRemove, pagesToUpdate } = pendingChanges
          // Serialize pendingChanges (uses type Set) to send to server side.
          sendMessage(MessageID.StudioCommitChanges, {
            pageNameToPageState: pages,
            pendingChanges: {
              pagesToRemove: [...pagesToRemove.keys()],
              pagesToUpdate: [...pagesToUpdate.keys()]
            }
          })
        }
      })
    })
  )
);
export default useStudioStore;
