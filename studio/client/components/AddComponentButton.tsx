import { useCallback, useState } from 'react'
import { v4 } from 'uuid'
import { ComponentState, ModuleMetadata, InternalModuleNames, StandardComponentMetaData } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export default function AddComponentButton() {
  const { moduleNameToComponentMetadata, pageState, setPageState } = useStudioContext()
  const [moduleName, setModuleName] = useState<string>(InternalModuleNames.LocalComponents)
  const moduleMetadata: ModuleMetadata = moduleNameToComponentMetadata[moduleName]

  const addComponentToPageState = useCallback((
    componentName: string,
    componentMetadata: StandardComponentMetaData
  ) => {
    const newComponentState: ComponentState = {
      name: componentName,
      props: componentMetadata.initialProps || {},
      uuid: v4(),
      moduleName
    }
    let i = pageState.componentsState.length - 1
    for(; i >= 0; i--) {
      const currComponentState = pageState.componentsState[i]
      if (!moduleNameToComponentMetadata[currComponentState.moduleName].components[currComponentState.name].global) {
        break;
      }
    }
    const indexToInsert = i === -1 ? pageState.componentsState.length : i + 1
    const newComponentsState = pageState.componentsState.slice(0)
    newComponentsState.splice(indexToInsert, 0, newComponentState)
    setPageState({
      ...pageState,
      componentsState: newComponentsState
    })
  }, [moduleMetadata, moduleName, pageState, setPageState])

  return (
    <>
      <select className="select w-full max-w-xs" onChange={e => setModuleName(e.target.value)} value={moduleName}>
        {Object.entries(moduleNameToComponentMetadata)
          .filter(([_, metadata]) =>
            Object.values(metadata.components).filter(({ editable }) => editable).length > 0
          )
          .map(([moduleName]) =>
            <option key={moduleName}>{moduleName}</option>
          )}
      </select>
      <div className="dropdown mb-2">
        <label className="btn m-1" tabIndex={0}>Add Component</label>
        <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
          {Object.entries(moduleMetadata.components)
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