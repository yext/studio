import { useState } from 'react'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import PropEditor, { PropState, TSPropShape } from './PropEditor'
import SiteSettings from './SiteSettings'
import updatePageComponentProps from '../endpoints/updatePageComponentProps'
import { ToastContainer, toast } from 'react-toastify'
import PagePreview from './PagePreview'
import '../endpoints/ServerDataContext'
import { sendFromClient } from '../endpoints/ServerDataContext'

export type PageComponentsState = {
  name: 'Banner',
  props: Record<string, number | string | boolean>
}[]

export interface StudioProps {
  componentsToPropShapes: {
    Banner: TSPropShape
  },
  // only supports a page named "index" for now
  componentsOnPage: {
    index: PageComponentsState
  }
}

export function Studio(props: StudioProps) {
  function renderComponentOptionsDropdown() {
    return (
      <DropdownButton title='Add Component!' onSelect={() => {
        sendFromClient()
        // TODO add component
      }}>
        <Dropdown.Item eventKey='Banner'>Banner</Dropdown.Item>
      </DropdownButton>
    )
  }

  const [pageComponentsState, setPageComponentsState] = useState(props.componentsOnPage.index)

  return (
    <div className='h-screen w-screen flex flex-row'>
      <div className='h-screen w-2/5 bg-slate-500 flex flex-col'>
        <ToastContainer autoClose={1000}/>
        <h1 className='text-3xl text-white'>Yext Studio</h1>
        {renderComponentOptionsDropdown()}
        {renderPropEditors(props, pageComponentsState, setPageComponentsState)}
        <button className='btn' onClick={async () => {
          console.log('pagecomponentsstate', pageComponentsState)
          const text = await updatePageComponentProps(pageComponentsState)
          toast(text)
        }}>
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
      console.log('setting updated prop state', val, ' for component', c.name)
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