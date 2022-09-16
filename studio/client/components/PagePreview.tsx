import React, { FunctionComponent, useEffect, useCallback, useState, useMemo, createElement, useRef, ReactElement } from 'react'
import { ModuleNameToComponentMetadata, PageState, ComponentState, ComponentMetadata, PropState } from '../../shared/models'
import { useStudioContext } from './useStudioContext'
import getPreviewProps from '../utils/getPreviewProps'
import ComponentPreviewBoundary from './ComponentPreviewBoundary'
import mapComponentStates from '../../shared/mapComponentStates'

export default function PagePreview() {
  const { pageState } = useStudioContext()
  const elements = useElements()

  return (
    <div className='w-full h-full'>
      <ComponentPreviewBoundary key={pageState.layoutState.name}>
        {elements}
      </ComponentPreviewBoundary>
    </div>
  )
}

function useElements() {
  const { pageState, moduleNameToComponentMetadata, streamDocument, siteSettingsState } = useStudioContext()
  const importedComponents = useImportedComponents(pageState, moduleNameToComponentMetadata)
  const siteSettingsObj = useSiteSettings(siteSettingsState)

  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(importedComponents).length === 0) {
      return null
    }
    const elements = createStudioElements(
      pageState.componentsState, importedComponents, streamDocument, siteSettingsObj)
    const layoutName = pageState.layoutState.name
    if (importedComponents[layoutName]) {
      return createElement(importedComponents[layoutName], {}, elements)
    } else if (layoutName && layoutName.charAt(0) === layoutName.charAt(0).toLowerCase()) {
      return createElement(layoutName, {}, elements)
    } else {
      console.error(`Unable to load Layout component "${layoutName}", render children components directly on page..`)
      return elements
    }
  }, [
    importedComponents,
    pageState.componentsState,
    pageState.layoutState.name,
    siteSettingsObj,
    streamDocument
  ])
}

function createStudioElements(
  components: ComponentState[],
  importedComponents: Record<string, ComponentImportType>,
  streamDocument: Record<string, any>,
  siteSettingsObj: Record<string, any>,
): (ReactElement | null)[] {
  return mapComponentStates(components, (c, children, i) => {
    if (!importedComponents[c.name]) {
      console.error(`Expected to find component loaded for ${c.name} but none found.`)
      return null
    }
    const previewProps = getPreviewProps(c.props, streamDocument, siteSettingsObj)

    const component = createElement(importedComponents[c.name], {
      ...previewProps,
      key: `${c.name}-${i}`
    }, ...children)

    return (
      <ComponentPreviewBoundary key={`${JSON.stringify(previewProps)}-${c.uuid}`}>
        {component}
      </ComponentPreviewBoundary>
    )
  })
}

type ComponentImportType = FunctionComponent<Record<string, unknown>> | string

function useImportedComponents(
  pageState: PageState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
): Record<string, ComponentImportType> {
  const [
    importedComponents,
    setImportedComponents
  ] = useState<Record<string, ComponentImportType>>({})
  // Use ref instead of "loadedComponents" to avoid triggering rerender (infinite loop)
  // in useCallback/useEffect logic
  const importedComponentsRef = useRef<Record<string, ComponentImportType>>(importedComponents)

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
    if (name in importedComponentsRef.current) {
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
      setImportedComponents(prev => {
        const newState = { ...prev, ...newLoadedComponents }
        importedComponentsRef.current = newState
        return newState
      })
    })
  }, [importComponent, pageState.componentsState, pageState.layoutState])

  return importedComponents
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

function useSiteSettings(siteSettingsProp: PropState): Record<string, any> {
  const siteSettingsObj = {}
  Object.entries(siteSettingsProp).forEach(([propName, propData]) => {
    siteSettingsObj[propName] = propData.value
  })
  return siteSettingsObj
}