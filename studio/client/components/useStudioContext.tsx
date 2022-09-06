import { TemplateProps } from '@yext/pages'
import React, { createContext, useContext } from 'react'
import { PageState } from '../../shared/models'
import { StudioProps } from './Studio'

export interface StudioContextType {
  moduleNameToComponentMetadata: StudioProps['moduleNameToComponentMetadata'],
  pageState: PageState,
  setPageState: React.Dispatch<React.SetStateAction<PageState>>,
  siteSettings: StudioProps['siteSettings'],
  streamDocument: TemplateProps['document'],
  setStreamDocument: React.Dispatch<React.SetStateAction<TemplateProps['document']>>,
  activeComponentUUID: string | undefined,
  setActiveComponentUUID: React.Dispatch<React.SetStateAction<string | undefined>>,
  initialPageState: Readonly<PageState>
}

export const StudioContext = createContext<StudioContextType | null>(null)

export function useStudioContext(): StudioContextType {
  const studioContext = useContext(StudioContext)
  if (studioContext === null) {
    throw new Error('Tried to use StudioContext when none exists.')
  }
  return studioContext
}
