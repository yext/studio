import create from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual } from "lodash";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getStoreWithoutImportedComponents } from "./utils";

enableMapSet();

/**
 * Studio's state manager in form of a hook to access and update states.
 */
const useStudioStore = create<StudioStore>()(
  temporal(
    immer(
      withLenses(() => ({
        fileMetadatas: lens(createFileMetadataSlice),
        pages: lens(createPageSlice),
        siteSettings: lens(createSiteSettingSlice),
      }))
    ),
    {
      equality: (currStore, pastStore) =>
        isEqual(
          getStoreWithoutImportedComponents(currStore),
          getStoreWithoutImportedComponents(pastStore)
        ),
      handleSet: (handleSet) => throttle(handleSet, 500),
    }
  )
);
export default useStudioStore;
