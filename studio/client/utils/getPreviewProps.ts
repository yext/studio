import { ModuleNameToComponentMetadata, ComponentState, PropType } from '../../shared/models'

// TODO(oshi): don't use hardcoded document
import streamDocument from '../../../localData/studio-stream-id__2a31f273ad1944ccdff93d07c7a8dd77.json'
import lodashGet from 'lodash/get'

export default function getPreviewProps(
  { moduleName, props, name }: ComponentState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = { ...props }
  Object.keys(props).forEach(propName => {
    if (!moduleName) {
      return
    }
    const componentMetadata = moduleNameToComponentMetadata[moduleName][name]
    if (!componentMetadata.propShape) {
      return
    }
    const propType: PropType = componentMetadata.propShape[propName].type
    if (propType === 'StreamsDataPath') {
      const templateString = props[propName]
      if (typeof templateString !== 'string') {
        console.error('StreamsDataPath should be a string, found', typeof templateString)
        return
      }
      transformedProps[propName] = templateString.replaceAll(/\${(.*?)}/g, (...args) => {
        return lodashGet({ document: streamDocument }, args[1]) ?? args[0]
      })
    }
  })
  return transformedProps
}