import React, { FunctionComponent, useEffect } from 'react'
import { useState } from 'react'
import { ModuleNameToComponentMetadata, PageComponentsState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'
const bob = '@yext/answers-react-components'
// import(bob).then(m => console.log('hi!', m))
import('@yext/answers-react-components').then(m => console.log('hihi!', m))
console.log(import.meta.glob('@yext/answers-react-components'))

export default function PagePreview() {
  const { pageComponentsState, moduleNameToComponentMetadata } = useStudioContext()
  const [
    componentNameToComponent,
    loadedComponents
  ] = useComponents(pageComponentsState, moduleNameToComponentMetadata)

  return (
    <div className='w-full h-full'>
      {loadedComponents.map((c, i) => React.createElement(componentNameToComponent[c.name], {
        ...c.props,
        key: `${c.name}-${i}`
      }))}
    </div>
  )
}

/**
 * TODO(oshi): use import.meta.glob for components that live in the filesystem. Components provided
 * through npm probably still need a different strategy.
 */
function useComponents(
  pageComponentsState: PageComponentsState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
): [Record<string, FunctionComponent>, PageComponentsState] {
  const [componentNameToComponent, setComponentNameToComponent] = useState({})
  const [loadedComponents, setLoadedComponents] = useState<PageComponentsState>([])

  useEffect(() => {
    const seenNames = new Set()
    const componentPromises = Promise.all(pageComponentsState.map(c => {
      const { name, moduleName } = c
      if (seenNames.has(name)) {
        return null
      }
      seenNames.add(name)
      const { importIdentifier } = moduleNameToComponentMetadata[moduleName][name]
      console.log(importIdentifier)
      return import(importIdentifier).then(module => {
        console.log('loaded module', importIdentifier, name, module )
        console.log(module[name] ?? module.default as FunctionComponent)
        return {
          name,
          Component: module[name] ?? module.default as FunctionComponent
        }
      })
    }))
    componentPromises.then(components => {
      const componentNameToComponent = components.reduce((prev, curr) => {
        if (!curr) {
          return prev
        }
        prev[curr.name] = curr.Component
        return prev
      }, {})
      setComponentNameToComponent(componentNameToComponent)
      setLoadedComponents(pageComponentsState)
    })
  }, [moduleNameToComponentMetadata, pageComponentsState])

  return [componentNameToComponent, loadedComponents]
}