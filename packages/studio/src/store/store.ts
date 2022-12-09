import create from 'zustand'
import { withLenses, lens } from '@dhmk/zustand-lens'
import { immer } from 'zustand/middleware/immer'

import { StudioStore } from './models/store'
import { createFileMetadatasSlice } from './slices/fileMetadatas'
import { createPagesSlice } from './slices/pages'
import { createSiteSettingsSlice } from './slices/siteSettings'

/**
 * Studio's state manager in form of a hook to access and update states.
 */
export const useStudioStore = create<StudioStore>()(
  immer(
    withLenses(
      () => ({
        fileMetadatas: lens(createFileMetadatasSlice),
        pages: lens(createPagesSlice),
        siteSettings: lens(createSiteSettingsSlice)
      })
    ),
  )
)