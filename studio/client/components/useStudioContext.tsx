import { createContext, useContext } from 'react'
import { PageComponentsState } from '../../shared/models'
import { StudioProps } from './Studio'

export interface StudioContextType {
  moduleNameToComponentMetadata: StudioProps['moduleNameToComponentMetadata'],
  pageComponentsState: PageComponentsState,
  setPageComponentsState: React.Dispatch<React.SetStateAction<PageComponentsState>>
}

export const StudioContext = createContext<StudioContextType | null>(null)

export function useStudioContext(): StudioContextType {
  const studioContext = useContext(StudioContext)
  if (studioContext === null) {
    throw new Error('Tried to use StudioContext when none exists.')
  }
  return studioContext
}
