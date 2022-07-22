import { useState } from 'react'
import { v1 } from 'uuid'
import { PossibleModuleNames } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export default function AddComponentButton() {
  const { moduleNameToComponentMetadata, pageComponentsState, setPageComponentsState } = useStudioContext()
  const [moduleName, setModuleName] = useState<PossibleModuleNames>('localComponents')

  return (
    <>
      <select className="select w-full max-w-xs" onChange={e => setModuleName(e.target.value as PossibleModuleNames)} value={moduleName}>
        {Object.keys(moduleNameToComponentMetadata).map(m =>
          <option key={m}>{m}</option>
        )}
      </select>
      <div className="dropdown mb-2">
        <label className="btn m-1" tabIndex={0}>Add Component</label>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
          {Object.entries(moduleNameToComponentMetadata[moduleName]).map(([name, data]) => (
            <li key={name}>
              <button onClick={() => {
                setPageComponentsState(pageComponentsState.concat([{
                  name,
                  props: data.initialProps,
                  uuid: v1(),
                  moduleName
                }]))
              }}>
                {name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}