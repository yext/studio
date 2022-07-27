import { useState } from 'react'
import SiteSettings, { SiteSettingsProps } from './SiteSettings'
import PagePreview from './PagePreview'
import { PageComponentsState, ModuleNameToComponentMetadata } from '../../shared/models'
import { StudioContext } from './useStudioContext'
import { PageEditor } from './PageEditor'

export interface StudioProps {
  siteSettings: SiteSettingsProps,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageComponentsState
  }
}

enum Tab {
  PageEditor = 'Page Editor',
  SiteSettings = 'Site Settings'
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, moduleNameToComponentMetadata, siteSettings } = props
  const [pageComponentsState, setPageComponentsState] = useState(componentsOnPage.index)
  const value = { moduleNameToComponentMetadata, pageComponentsState, setPageComponentsState }
  const [currentTab, setTab] = useState(Tab.PageEditor)

  return (
    <StudioContext.Provider value={value}>
      <div className='min-h-screen h-full w-screen flex flex-row'>
        <div className='w-2/5 bg-slate-500 flex flex-col'>
          <h1 className='text-3xl text-white'>Yext Studio</h1>
          <nav className='bg-gray-800 flex flex-row'>
            <button onClick={() => { setTab(Tab.PageEditor) }} className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2'>Page Editor</button>
            <div className='text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'></div>
            <button onClick={() => { setTab(Tab.SiteSettings) }} className='bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium" hover:underline p-2'>Site Settings</button>
          </nav>
          {currentTab === Tab.PageEditor ? <PageEditor /> : <SiteSettings {...siteSettings}/>}
        </div>
        <PagePreview />
      </div>
    </StudioContext.Provider>
  )
}
