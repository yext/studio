import React, { FunctionComponent, useEffect, useCallback, useState, useMemo } from 'react'
import { useRef } from 'react'
import { ModuleNameToComponentMetadata, PageState, ComponentState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'

export default function PagePreview() {
  const { pageState, moduleNameToComponentMetadata } = useStudioContext()
  const [
    loadedComponents
  ] = useComponents(pageState, moduleNameToComponentMetadata)
  const componentsToRender = useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(loadedComponents).length === 0) {
      return null
    }
    const children = pageState.componentsState.map((c, i) => {
      if (!loadedComponents[c.name]) {
        console.error(`Expected to find component loaded for ${c.name} but none found - possibly due to a race condition.`)
        return null
      }
      return React.createElement(loadedComponents[c.name], {
        ...c.props,
        verticalConfigMap: {},
        key: `${c.name}-${i}`
      })
    })
    if (loadedComponents[pageState.layoutState.name]) {
      return React.createElement(loadedComponents[pageState.layoutState.name], {}, children)
    } else {
      console.error(`Unable to load Layout component "${pageState.layoutState.name}", render children components directly on page..`)
      return children
    }
  }, [loadedComponents, pageState.componentsState, pageState.layoutState.name])

  return (
    <div className='w-full h-full'>
      {componentsToRender}
    </div>
  )
}

type ComponentImportType = FunctionComponent<Record<string, unknown>> | string

function useComponents(
  pageState: PageState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
): [Record<string, ComponentImportType>] {
  const [
    loadedComponents,
    setLoadedComponents
  ] = useState<Record<string, ComponentImportType>>({})
  // Use ref instead of "loadedComponents" to avoid triggering rerender (infinite loop)
  // in useCallback/useEffect logic
  const loadedComponentsRef = useRef<Record<string, ComponentImportType>>(loadedComponents)

  const modules = useMemo(() => import.meta.glob<Record<string, unknown>>(['../../../src/components/*.tsx', '../../../src/layouts/*.tsx']), [])
  const importComponent = useCallback((
    c: ComponentState,
    directoryPath: string,
    componentNameToComponent: Record<string, ComponentImportType>
  ): Promise<void> | null => {
    const { name, moduleName } = c
    if (name in loadedComponentsRef.current) {
      return null
    }
    if (moduleName === 'localComponents') {
      return modules[`${directoryPath}/${name}.tsx`]().then(module => {
        componentNameToComponent[name] = getFunctionComponent(module, name)
      })
    } else {
      const { importIdentifier } = moduleNameToComponentMetadata[moduleName][name]
      return import(importIdentifier).then(module => {
        componentNameToComponent[name] = getFunctionComponent(module, name)
      })
    }
  }, [moduleNameToComponentMetadata, modules])

  useEffect(() => {
    const newLoadedComponents = {}
    Promise.all([
      importComponent(pageState.layoutState, '../../../src/layouts', newLoadedComponents),
      ...pageState.componentsState.map(c => importComponent(c, '../../../src/components', newLoadedComponents))
    ]).then(() => {
      // TODO(oshi): this probably runs into race conditions issues
      setLoadedComponents(prev => {
        const newState = { ...prev, ...newLoadedComponents }
        loadedComponentsRef.current = newState
        return newState
      })
    })
  }, [importComponent, pageState.componentsState, pageState.layoutState])

  return [loadedComponents]
}

function getFunctionComponent(module: Record<string, unknown>, name: string): ComponentImportType {
  if (typeof module[name] === 'function') {
    return module[name] as FunctionComponent
  } else if (typeof module['default'] === 'function') {
    return module['default'] as FunctionComponent
  } else {
    return `Module ${name} is not a valid functional component.`
  }
}