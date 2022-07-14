import { useState } from 'react'
import { TSPropShape } from '../../shared/models'
import SiteSettings from './SiteSettings'
import sendMessage from '../messaging/sendMessage'
import PagePreview from './PagePreview'
import { PageComponentsState } from '../../shared/models'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'
import { StudioContext } from './useStudioContext'
import PropEditors from './PropEditors'

export interface StudioProps {
  componentsToPropShapes: Record<string, TSPropShape>,
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageComponentsState
  }
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, componentsToPropShapes } = props
  const [pageComponentsState, setPageComponentsState] = useState(componentsOnPage.index)

  return (
    <StudioContext.Provider value={{ componentsToPropShapes, pageComponentsState, setPageComponentsState }}>
      <div className='h-screen w-screen flex flex-row'>
        <div className='h-screen w-2/5 bg-slate-500 flex flex-col'>
          <h1 className='text-3xl text-white'>Yext Studio</h1>
          <AddComponentButton />
          <PropEditors/>
          <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
            path: 'src/pages/index.tsx',
            state: pageComponentsState
          })}>
            Update Component Props
          </button>
          <SiteSettings />
        </div>
        <PagePreview />
      </div>
    </StudioContext.Provider>
  )
}
