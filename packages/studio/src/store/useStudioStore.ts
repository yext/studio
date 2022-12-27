import create from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { enableMapSet } from "immer";

enableMapSet();

/**
 * Studio's state manager in form of a hook to access and update states.
 */
const useStudioStore = create<StudioStore>()(
  immer(
    withLenses(() => ({
      fileMetadatas: lens(createFileMetadataSlice),
      pages: lens(createPageSlice),
      siteSettings: lens(createSiteSettingSlice),
    }))
  )
);
export default useStudioStore;
