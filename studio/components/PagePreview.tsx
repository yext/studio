import React, { useEffect } from 'react'
import { useState } from 'react'
import { PageComponentsState } from './Studio'

export default function PagePreview({
  pageComponentsState
}: {
  pageComponentsState: PageComponentsState
}) {
  const [componentNameToComponent, loadedComponents] = useComponents(pageComponentsState)

  return (
    <div className='w-full h-full'>
      {loadedComponents.map(c => React.createElement(componentNameToComponent[c.name], c.props))}
    </div>
  )
}

function useComponents(pageComponentsState: PageComponentsState) {
  const [componentNameToComponent, setComponentNameToComponent] = useState({})
  const [loadedComponents, setLoadedComponents] = useState<PageComponentsState>([])

  useEffect(() => {
    const componentNames = [...new Set(pageComponentsState.map(p => p.name))]
    const componentPromises = Promise.all(componentNames.map(name => {
      return import('../../../src/components/' + name + '.tsx').then(module => ({
        name,
        Component: module.default ?? module[name] as React.Component
      }))
    }))
    componentPromises.then(components => {
      const componentNameToComponent = components.reduce((prev, curr) => {
        prev[curr.name] = curr.Component
        return prev
      }, {})
      setComponentNameToComponent(componentNameToComponent)
      setLoadedComponents(pageComponentsState)
    })
  }, [pageComponentsState])

  return [componentNameToComponent, loadedComponents]
}