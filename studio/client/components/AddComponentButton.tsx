import { v1 } from 'uuid'
import { useStudioContext } from './useStudioContext'

export default function AddComponentButton() {
  const { componentsToPropShapes, pageComponentsState, setPageComponentsState } = useStudioContext()

  return (
    <div className="dropdown mb-2">
      <label className="btn m-1" tabIndex={0}>Add Component</label>
      <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
        {Object.keys(componentsToPropShapes).map(name => (
          <li key={name}>
            <button onClick={() => {
              setPageComponentsState(pageComponentsState.concat([{
                name,
                props: {},
                uuid: v1()
              }]))
            }}>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}