import create from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";

import { StudioStore } from "./models/store";
import { createFileMetadataSlice } from "./slices/fileMetadataSlice";
import { createPageSlice } from "./slices/pageSlice";
import { createSiteSettingSlice } from "./slices/siteSettingSlice";

/**
 * Studio's state manager in form of a hook to access and update states.
 */
export const useStudioStore = create<StudioStore>()(
  immer(
    withLenses(() => ({
      fileMetadatas: lens(createFileMetadataSlice),
      pages: lens(createPageSlice),
      siteSettings: lens(createSiteSettingSlice),
    }))
  )
);
