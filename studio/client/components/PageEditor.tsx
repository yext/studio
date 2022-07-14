import PropEditor from './PropEditor'
import sendMessage from '../messaging/sendMessage'
import { PageComponentsState, TSPropShape, PropState } from '../../shared/models'
import { MessageID } from '../../shared/messages'
import AddComponentButton from './AddComponentButton'
import { useStudioContext } from './useStudioContext'

export function PageEditor(): JSX.Element {
  const { componentsToPropShapes, pageComponentsState, setPageComponentsState } = useStudioContext()
  return (
    <>
      <AddComponentButton />
      {renderPropEditors(componentsToPropShapes, pageComponentsState, setPageComponentsState)}
      <button className='btn' onClick={() => sendMessage(MessageID.UpdatePageComponentProps, {
        path: 'src/pages/index.tsx',
        state: pageComponentsState
      })}>
        Update Component Props
      </button>
    </>
  )
}

function renderPropEditors(
  componentsToPropShapes: Record<string, TSPropShape>,
  pageComponentsState: PageComponentsState,
  setPageComponentsState: (val: PageComponentsState) => void
) {
  return pageComponentsState.map((c, i) => {
    const setPropState = (val: PropState) => {
      const copy = [...pageComponentsState]
      copy[i].props = val
      setPageComponentsState(copy)
    }
    if (!(c.name in componentsToPropShapes)) {
      console.error('unknown component', c.name, 'gracefully skipping for now.')
      return null
    }
    return (
      <div className='mt-2' key={c.name + '-' + i}>
        <div className='text-white'>{c.name}</div>
        <PropEditor
          propShape={componentsToPropShapes[c.name]}
          propState={c.props}
          setPropState={setPropState}
        />
      </div>
    )
  })
}
