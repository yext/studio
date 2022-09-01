import { useState } from 'react'
import { v1 } from 'uuid'
import { PossibleModuleNames, StandardComponentMetaData } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export default function AddComponentButton() {
  const { moduleNameToComponentMetadata, pageState, setPageState } = useStudioContext()
  const [moduleName, setModuleName] = useState<PossibleModuleNames>('localComponents')
  return (
    <>
      <select className="select w-full max-w-xs" onChange={e => setModuleName(e.target.value as PossibleModuleNames)} value={moduleName}>
        {Object.entries(moduleNameToComponentMetadata)
          .filter(([_, metadata]) => {
            return Object.values(metadata).filter(({ editable }) => editable).length > 0
          })
          .map(([moduleName]) =>
            <option key={moduleName}>{moduleName}</option>
          )}
      </select>
      <div className="dropdown mb-2">
        <label className="btn m-1" tabIndex={0}>Add Component</label>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
          {Object.entries(moduleNameToComponentMetadata[moduleName])
            .filter((moduleMetadataEntry): moduleMetadataEntry is [string, StandardComponentMetaData] => {
              const [_, data] = moduleMetadataEntry
              return !data.global && data.editable
            })
            .map(([name, data]) => (
              <li key={name}>
                <button onClick={() => {
                  setPageState({
                    ...pageState,
                    componentsState: pageState.componentsState.concat([{
                      name,
                      props: data.initialProps || {},
                      uuid: v1(),
                      moduleName
                    }])
                  })
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