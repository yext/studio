import { useState } from 'react'
import { SiteSettingsProps } from './SiteSettings'
import { PageState, ModuleNameToComponentMetadata, ComponentState } from '../../shared/models'
import { StudioContext } from './useStudioContext'
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
  }
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, moduleNameToComponentMetadata, siteSettings } = props
  const [pageState, setPageState] = useState(componentsOnPage.index)
  const [streamDocument, setStreamDocument] = useState({})
  const [activeComponentState, setActiveComponentState] = useState<string | undefined>()
  const [pageStateOnFile, setPageStateOnFile] = useState<PageState>(cloneDeep(componentsOnPage.index))

  const value = {
    moduleNameToComponentMetadata,
    pageState,
    setPageState,
    siteSettings,
    streamDocument,
    setStreamDocument,
    activeComponentState,
    setActiveComponentState,
    pageStateOnFile,
    setPageStateOnFile
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
