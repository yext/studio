import { create, StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual, cloneDeep } from "lodash";

import { StudioStore } from "./models/StudioStore";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/pages/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getUserUpdatableStore } from "./utils";
import sendMessage from "../messaging/sendMessage";
import { MessageID } from "@yext/studio-plugin";
import registerMessageListener from "../messaging/registerMessageListener";
import getCreateModuleAction from "./createModuleAction";
import StudioActions from "./StudioActions";
import createStudioConfigSlice from "./slices/createStudioConfigSlice";
import createPreviousSaveSlice from "./slices/createPreviousSaveSlice";

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
            s.fileMetadatas.pendingChanges = {
              modulesToUpdate: new Set<string>(),
            };
          });
        }
      });
      const saveChanges = () => {
        const { pages, pendingChanges: pendingPageChanges } = get().pages;
        const { pagesToRemove, pagesToUpdate } = pendingPageChanges;
        const { UUIDToFileMetadata, pendingChanges: pendingModuleChanges } =
          get().fileMetadatas;
        const { modulesToUpdate } = pendingModuleChanges;
        const { values } = get().siteSettings;
        // Serialize pendingChanges (uses type Set) to send to server side.
        sendMessage(MessageID.SaveChanges, {
          pageNameToPageState: pages,
          UUIDToFileMetadata,
          pendingChanges: {
            pagesToRemove: [...pagesToRemove.keys()],
            pagesToUpdate: [...pagesToUpdate],
            modulesToUpdate: [...modulesToUpdate.keys()],
          },
          siteSettings: { values },
        });
        // Update the previousSave state.
        set((s) => {
          const previousSaveState = cloneDeep({
            siteSettings: {
              values: get().siteSettings.values,
            },
            fileMetadatas: {
              UUIDToFileMetadata: UUIDToFileMetadata,
            },
          });
          s.previousSave = previousSaveState;
        });
      };

      return {
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        siteSettings: lens(createSiteSettingSlice),
        saveChanges,
        createModule: getCreateModuleAction(get),
        previousSave: lens(createPreviousSaveSlice),
        actions: new StudioActions(
          () => get().pages,
          () => get().fileMetadatas,
          () => get().studioConfig
        ),
        studioConfig: lens(createStudioConfigSlice),
      };
    })
  )
);

export default useStudioStore;
