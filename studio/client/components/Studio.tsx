import { useState } from 'react'
import PropEditor, { PropState } from './PropEditor'
import { TSPropShape } from '../../shared/models'
import SiteSettings from './SiteSettings'
import sendMessage from '../messaging/sendMessage'
import PagePreview from './PagePreview'
import { PageComponentsState } from '../../shared/models'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'

export interface StudioProps {
  componentsToPropShapes: {
    Banner: TSPropShape
  },
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageComponentsState
  }
}

export default function Studio(props: StudioProps) {
  const { componentsOnPage, componentsToPropShapes } = props;
  const [pageComponentsState, setPageComponentsState] = useState(componentsOnPage.index)

  return (
    <div className='h-screen w-screen flex flex-row'>
      <div className='h-screen w-2/5 bg-slate-500 flex flex-col'>
        <h1 className='text-3xl text-white'>Yext Studio</h1>
        <AddComponentButton
          componentsToPropShapes={componentsToPropShapes}
          pageComponentsState={pageComponentsState}
          setPageComponentsState={setPageComponentsState}
        />
        {renderPropEditors(props, pageComponentsState, setPageComponentsState)}
        <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
          path: 'src/pages/index.tsx',
          state: pageComponentsState
        })}>
          Update Component Props
        </button>
        <SiteSettings />
      </div>
      <PagePreview pageComponentsState={pageComponentsState}/>
    </div>
  )
}

function renderPropEditors(
  props: StudioProps,
  pageComponentsState: PageComponentsState,
  setPageComponentsState: (val: PageComponentsState) => void
) {
  return pageComponentsState.map((c, i) => {
    const setPropState = (val: PropState) => {
      const copy = [...pageComponentsState]
      copy[i].props = val
      setPageComponentsState(copy)
    }
    if (!(c.name in props.componentsToPropShapes)) {
      console.error('unknown component', c.name, 'gracefully skipping for now.')
      return null
    }
    return (
      <PropEditor
        key={c.name + '-' + i}
        propShape={props.componentsToPropShapes[c.name]}
        propState={c.props}
        setPropState={setPropState}
      />
    )
  })
}