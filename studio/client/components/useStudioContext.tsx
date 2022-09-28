import { TemplateProps } from '@yext/pages'
import { createContext, useContext, Dispatch, SetStateAction } from 'react'
import { ComponentMetadata, PageState, PropState } from '../../shared/models'
import { StudioProps } from './Studio'

export interface StudioContextType {
  moduleNameToComponentMetadata: StudioProps['moduleNameToComponentMetadata'],
  pageState: PageState,
  setPageState: Dispatch<SetStateAction<PageState>>,
  siteSettingsMetadata: ComponentMetadata,
  siteSettingsState: PropState,
  setSiteSettingsState: Dispatch<SetStateAction<PropState>>,
  streamDocument: TemplateProps['document'],
  setStreamDocument: Dispatch<SetStateAction<TemplateProps['document']>>,
  activeComponentUUID: string | undefined,
  setActiveComponentUUID: Dispatch<SetStateAction<string | undefined>>,
  pageStateOnFile: PageState,
  setPageStateOnFile: Dispatch<SetStateAction<PageState>>,
  symbolNameToMetadata: StudioProps['symbolNameToMetadata'],
  setSymbolNameToMetadata: Dispatch<SetStateAction<StudioProps['symbolNameToMetadata']>>
}

export const StudioContext = createContext<StudioContextType | null>(null)

export function useStudioContext(): StudioContextType {
  const studioContext = useContext(StudioContext)
  if (studioContext === null) {
    throw new Error('Tried to use StudioContext when none exists.')
  }
  return studioContext
}
