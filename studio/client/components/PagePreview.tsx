import React, { FunctionComponent, useEffect, useCallback, useState, useMemo } from 'react'
import { useRef } from 'react'
import { ModuleNameToComponentMetadata, PageState, ComponentState, ComponentMetadata } from '../../shared/models'
import { useStudioContext } from './useStudioContext'
import getPreviewProps from '../utils/getPreviewProps'
import ComponentPreviewBoundary from './ComponentPreviewBoundary'

export default function PagePreview() {
  const { pageState, moduleNameToComponentMetadata, streamDocument } = useStudioContext()
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
      const previewProps = getPreviewProps(c.props, streamDocument)
      const component = React.createElement(loadedComponents[c.name], {
        ...previewProps,
        verticalConfigMap: {},
        key: `${c.name}-${i}`
      })
      return (
        <ComponentPreviewBoundary key={`${JSON.stringify(previewProps)}-${c.uuid}`}>{component}</ComponentPreviewBoundary>
      )
    })
    const layoutName = pageState.layoutState.name
    if (loadedComponents[layoutName]) {
      return React.createElement(loadedComponents[layoutName], {}, children)
    } else if (layoutName && layoutName.charAt(0) === layoutName.charAt(0).toLowerCase()) {
      return React.createElement(layoutName, {}, children)
    } else {
      console.error(`Unable to load Layout component "${layoutName}", render children components directly on page..`)
      return children
    }
  }, [loadedComponents, pageState.componentsState, pageState.layoutState.name, streamDocument])

  return (
    <div className='w-full h-full'>
      <ComponentPreviewBoundary key={pageState.layoutState.name}>
        {componentsToRender}
      </ComponentPreviewBoundary>
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

  const modules = useMemo(() => {
    return import.meta.glob<Record<string, unknown>>([
      '../../../src/components/*.tsx',
      '../../../src/layouts/*.tsx'
    ])
  }, [])

  const importComponent = useCallback((
    c: ComponentState,
    directoryPath: string,
    componentNameToComponent: Record<string, ComponentImportType>
  ): Promise<void> | null => {
    const { name, moduleName } = c
    // Avoid re-importing components
    if (name in loadedComponentsRef.current) {
      return null
    }
    // built-in JSX Element
    if (name && name.charAt(0) === name.charAt(0).toLowerCase()) {
      return null
    }
    if (['', 'Fragment', 'React.Fragment'].includes(name)) {
      componentNameToComponent[name] = React.Fragment
      return null
    }
    const { importIdentifier }: ComponentMetadata = moduleNameToComponentMetadata[moduleName][name]
    if (moduleName === 'localComponents') {
      const componentFilePath = `${directoryPath}/${importIdentifier.split('/').at(-1)}`
      return modules[componentFilePath]().then(module => {
        componentNameToComponent[name] = getFunctionComponent(module, name)
      })
    } else {
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
