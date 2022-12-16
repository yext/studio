import create, { UseBoundStore } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";

/**
 * Studio's state manager in form of a hook to access and update states.
 */
// export const useStudioStore: UseBoundStore<WithImmer<StoreApi<StudioStore>>> = create<StudioStore>()(
//   immer(
//     withLenses(() => ({
//       fileMetadatas: lens(createFileMetadataSlice),
//       pages: lens(createPageSlice),
//       siteSettings: lens(createSiteSettingSlice),
//     }))
//   )
// );
