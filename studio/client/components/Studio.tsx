import { useState } from 'react'
import { SiteSettingsProps } from './SiteSettings'
import { PageState, ModuleNameToComponentMetadata, SymbolMetadata } from '../../shared/models'
import { StudioContext, StudioContextType } from './useStudioContext'
import RightSidebar from './RightSidebar'
import PagePreview from './PagePreview'
import LeftSidebar from './LeftSidebar'
import { cloneDeep } from 'lodash'

export interface StudioProps {
  siteSettings: SiteSettingsProps,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageState
  },
  symbolNameToMetadata: Record<string, SymbolMetadata>
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, moduleNameToComponentMetadata, siteSettings } = props
  const [pageState, setPageState] = useState(componentsOnPage.index)
  const [streamDocument, setStreamDocument] = useState({})
  const [siteSettingsState, setSiteSettingsState] = useState(siteSettings.propState)
  const [activeComponentUUID, setActiveComponentUUID] = useState<string | undefined>()
  const [pageStateOnFile, setPageStateOnFile] = useState<PageState>(cloneDeep(componentsOnPage.index))
  const [symbolNameToMetadata, setSymbolNameToMetadata] = useState(props.symbolNameToMetadata)
  const [activeSymbolName, setActiveSymbolName] = useState<string | undefined>(undefined)

  const activeComponentsState = activeSymbolName
    ? symbolNameToMetadata[`${activeSymbolName}.symbol.tsx`]?.content
    : pageState.componentsState

  const value: StudioContextType = {
    activeSymbolName,
    setActiveSymbolName,
    activeComponentsState,
    setActiveComponentsState(componentsState) {
      if (!activeSymbolName) {
        setPageState({
          ...pageState,
          componentsState
        })
      } else {
        setSymbolNameToMetadata({
          ...symbolNameToMetadata,
          activeSymbolName: {
            content: componentsState
          }
        })
      }
    },
    pageState,
    moduleNameToComponentMetadata,
    siteSettingsMetadata: siteSettings.componentMetadata,
    siteSettingsState,
    setSiteSettingsState,
    streamDocument,
    setStreamDocument,
    activeComponentUUID,
    setActiveComponentUUID,
    pageStateOnFile,
    setPageStateOnFile,
    symbolNameToMetadata,
    setSymbolNameToMetadata
  }

  return (
    <StudioContext.Provider value={value}>
      <div className='flex h-screen'>
        <LeftSidebar />
        <PagePreview />
        <RightSidebar />
      </div>
    </StudioContext.Provider>
  )
}
