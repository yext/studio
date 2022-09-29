import { useCallback, useState } from 'react'
import { v4 } from 'uuid'
import { RegularComponentState, ModuleMetadata, PossibleModuleNames, StandardComponentMetaData } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export default function AddComponentButton() {
  const {
    moduleNameToComponentMetadata,
    activeComponentsState,
    setActiveComponentsState
  } = useStudioContext()
  const [moduleName, setModuleName] = useState<PossibleModuleNames>('localComponents')
  const moduleMetadata: ModuleMetadata = moduleNameToComponentMetadata[moduleName]

  const addComponentToPageState = useCallback((
    componentName: string,
    componentMetadata: StandardComponentMetaData
  ) => {
    const newComponentState: RegularComponentState = {
      name: componentName,
      props: componentMetadata.initialProps || {},
      uuid: v4(),
      moduleName
    }
    let i = activeComponentsState.length - 1
    while (i >= 0 && moduleMetadata[activeComponentsState[i].name].global) {
      i--
    }
    const indexToInsert = i === -1 ? activeComponentsState.length : i + 1
    const newComponentsState = activeComponentsState.slice(0)
    newComponentsState.splice(indexToInsert, 0, newComponentState)
    setActiveComponentsState(newComponentsState)
  }, [moduleMetadata, moduleName, activeComponentsState, setActiveComponentsState])

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
          {Object.entries(moduleMetadata)
            .filter((moduleMetadataEntry): moduleMetadataEntry is [string, StandardComponentMetaData] => {
              const [_, data] = moduleMetadataEntry
              return !data.global && data.editable
            })
            .map(([name, data]) => (
              <li key={name}>
                <button onClick={() => addComponentToPageState(name, data)}>
                  {name}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </>
  )
}