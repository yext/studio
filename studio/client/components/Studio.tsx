import { useState } from 'react'
import SiteSettings, { SiteSettingsProps } from './SiteSettings'
import PagePreview from './PagePreview'
import { PageComponentsState, ModuleNameToComponentMetadata } from '../../shared/models'
import { StudioContext } from './useStudioContext'
import { PageEditor } from './PageEditor'
import {
  BrowserRouter,
  Route,
  Routes
} from 'react-router-dom';
import { Navbar } from './Navbar'

export interface StudioProps {
  siteSettings: SiteSettingsProps,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageComponentsState
  }
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, moduleNameToComponentMetadata, siteSettings } = props
  const [pageComponentsState, setPageComponentsState] = useState(componentsOnPage.index)
  const value = { moduleNameToComponentMetadata, pageComponentsState, setPageComponentsState }

  return (
    <StudioContext.Provider value={value}>
      <div className='min-h-screen h-full w-screen flex flex-row'>
        <div className='w-2/5 bg-slate-500 flex flex-col'>
          <h1 className='text-3xl text-white'>Yext Studio</h1>
            <BrowserRouter>
              <Navbar/>
              
              <Routes>
                <Route path={"/studio/client/"} element={<PageEditor/>} />
                <Route path={"/SiteSettings"} element={<SiteSettings {...siteSettings}/>} />
              </Routes>
            </BrowserRouter>
        </div>
        <PagePreview />
      </div>
    </StudioContext.Provider>
  )
}
