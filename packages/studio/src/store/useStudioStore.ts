import create, { StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual, cloneDeep } from "lodash";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getUserUpdatableStore } from "./utils";
import sendMessage from "../messaging/sendMessage";
import { MessageID } from "@yext/studio-plugin";
import registerMessageListener from "../messaging/registerMessageListener";
import getCreateModuleAction from "./createModuleAction";
import createPreviousCommitSlice from "./slices/createPreviousCommitSlice";
import getDeleteModuleAction from "./deleteModuleAction";

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
      registerMessageListener(MessageID.StudioCommitChanges, (payload) => {
        if (payload.type === "success") {
          set((s) => {
            s.pages.pendingChanges = {
              pagesToRemove: new Set<string>(),
              pagesToUpdate: new Set<string>(),
            };
            s.fileMetadatas.pendingChanges = {
              modulesToUpdate: new Set<string>(),
            };
          });
        }
      });
      const commitChanges = () => {
        const { pages, pendingChanges: pendingPageChanges } = get().pages;
        const { pagesToRemove, pagesToUpdate } = pendingPageChanges;
        const { UUIDToFileMetadata, pendingChanges: pendingModuleChanges } =
          get().fileMetadatas;
        const { modulesToUpdate } = pendingModuleChanges;
        const { values } = get().siteSettings;
        // Serialize pendingChanges (uses type Set) to send to server side.
        sendMessage(MessageID.StudioCommitChanges, {
          pageNameToPageState: pages,
          UUIDToFileMetadata,
          pendingChanges: {
            pagesToRemove: [...pagesToRemove.keys()],
            pagesToUpdate: [...pagesToUpdate.keys()],
            modulesToUpdate: [...modulesToUpdate.keys()],
          },
          siteSettings: { values },
        });
        // Update the previousCommit state.
        set((s) => {
          const previousCommitState = cloneDeep({
            siteSettings: {
              values: get().siteSettings.values,
            },
          });
          s.previousCommit = previousCommitState;
        });
      };

      return {
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        siteSettings: lens(createSiteSettingSlice),
        commitChanges,
        createModule: getCreateModuleAction(get),
        deleteModule: getDeleteModuleAction(get),
        previousCommit: lens(createPreviousCommitSlice),
      };
    })
  )
);
export default useStudioStore;
