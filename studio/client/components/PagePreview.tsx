import React, { createElement, FunctionComponent, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import mapComponentStates from '../../shared/mapComponentStates'
import { ComponentMetadata, ComponentState, ComponentStateType, RegularComponentState } from '../../shared/models'
import getPreviewProps from '../utils/getPreviewProps'
import { useSiteSettings } from '../utils/useSiteSettings'
import ComponentPreviewBoundary from './ComponentPreviewBoundary'
import { useStudioContext } from './useStudioContext'

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
  const { pageState, streamDocument, activeComponentsState } = useStudioContext()
  const importedComponents = useImportedComponents()
  const siteSettingsObj = useSiteSettings()

  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(importedComponents).length === 0) {
      return null
    }
    const expressionSourcesValues = {
      document: streamDocument,
      siteSettings: siteSettingsObj
    }
    const elements = createStudioElements(
      activeComponentsState, importedComponents, expressionSourcesValues)
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
    activeComponentsState,
    pageState.layoutState.name,
    siteSettingsObj,
    streamDocument,
    activeComponentUUID
  ])
}

function createStudioElements(
  components: ComponentState[],
  importedComponents: Record<string, ImportType>,
  expressionSourcesValues: Record<string, Record<string, unknown>>,
  activeComponentUUID?: string
): (ReactElement | null)[] {
  return mapComponentStates(components, (c, children, i) => {
    if (!importedComponents[c.name]) {
      console.error(`Expected to find component loaded for ${c.name} but none found.`)
      return null
    }
    const previewProps = getPreviewProps(c.props, expressionSourcesValues)
    const component = createElement(importedComponents[c.name], {
      ...previewProps,
      key: `${c.name}-${i}`
    }, ...children)

    const borderClassName = classNames('before:border-2 before:absolute before:w-full before:h-full', {
      'before:border-red-600': activeComponentUUID === c.uuid,
      'before:border-transparent': activeComponentUUID !== c.uuid
    })

    return (
      <ComponentPreviewBoundary key={`${JSON.stringify(previewProps)}-${c.uuid}`}>
        <div className='relative'>
          <div className={borderClassName}>
            {component}
          </div>
        </div>
      </ComponentPreviewBoundary>
    )
  })
}

type ImportType = FunctionComponent<Record<string, unknown>> | string

function useImportedComponents(): Record<string, ComponentImportType> {
  const { pageState, moduleNameToComponentMetadata, activeComponentsState } = useStudioContext()
  const [
    importedComponents,
    setImportedComponents
  ] = useState<Record<string, ImportType>>({})
  const cssImportsRef = useRef<Record<string, ImportType>>({})

  // Use ref instead of "loadedComponents" to avoid triggering rerender (infinite loop)
  // in useCallback/useEffect logic
  const importedComponentsRef = useRef<Record<string, ImportType>>(importedComponents)

  const modules = useMemo(() => {
    return import.meta.glob<Record<string, unknown>>([
      '../../../src/components/*.tsx',
      '../../../src/layouts/*.tsx',
      '../../../src/symbols/*.tsx'
    ])
  }, [])

  const importCSS = useCallback((cssImports: string[]): Promise<void[]> => {
    const imports: Promise<void>[] = cssImports.filter(i => !(i in cssImportsRef.current)).map(async i => {
      const module = await import(i)
      cssImportsRef.current[i] = module['default']
    })
    return Promise.all(imports)
  }, [])

  const importComponent = useCallback(async (
    c: RegularComponentState,
    directoryPath: string,
    componentNameToComponent: Record<string, ImportType>
  ): Promise<void | void[] | null> => {
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
    const moduleMetadata = moduleNameToComponentMetadata[moduleName]
    const { importIdentifier }: ComponentMetadata = moduleMetadata.components[name]
    if (moduleName === InternalModuleNames.LocalComponents) {
      const componentFilePath = `${directoryPath}/${importIdentifier.split('/').at(-1)}`
      const importedModule = await modules[componentFilePath]()
      componentNameToComponent[name] = getFunctionComponent(importedModule, name)
    } else {
      const importedModule = await import(importIdentifier)
      componentNameToComponent[name] = getFunctionComponent(importedModule, name)
    }
    if (moduleMetadata.cssImports) {
      await importCSS(moduleMetadata.cssImports)
    }
  }, [moduleNameToComponentMetadata, modules, importCSS])

  useEffect(() => {
    const newLoadedComponents = {}
    Promise.all([
      // TODO: hardcoded setup for external component to display on PagePreview.
      // Remove this after npm components parsing work (SLAP-2392), and loop through the npm components here
      importComponent({
        name: 'SearchBar',
        props: {},
        uuid: 'someuuid',
        moduleName: '@yext/search-ui-react',
      }, '', newLoadedComponents),
      importComponent(pageState.layoutState, '../../../src/layouts', newLoadedComponents),
      ...activeComponentsState.map(c => {
        if (c.type === ComponentStateType.Symbol) {
          const componentFilePath = `../../../src/symbols/${c.name}.symbol.tsx`
          return modules[componentFilePath]().then(module => {
            newLoadedComponents[c.name] = getFunctionComponent(module, c.name)
          })
        }
        return importComponent(c, '../../../src/components', newLoadedComponents)
      })
    ]).then(() => {
      setImportedComponents(prev => {
        const newState = { ...prev, ...newLoadedComponents }
        importedComponentsRef.current = newState
        return newState
      })
    })
  }, [importComponent, activeComponentsState, pageState.layoutState, modules])

  return importedComponents
}

function getFunctionComponent(module: Record<string, unknown>, name: string): ImportType {
  if (typeof module[name] === 'function') {
    return module[name] as FunctionComponent
  } else if (typeof module['default'] === 'function') {
    return module['default'] as FunctionComponent
  } else {
    return `Module ${name} is not a valid functional component.`
  }
}
