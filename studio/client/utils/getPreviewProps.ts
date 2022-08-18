import { ModuleNameToComponentMetadata, ComponentState, PropType } from '../../shared/models'
import lodashGet from 'lodash/get'
import { TemplateProps } from '@yext/pages'

export const STREAMS_TEMPLATE_REGEX = /\${(.*?)}/g

export default function getPreviewProps(
  { moduleName, props, name }: ComponentState,
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  streamDocument: TemplateProps['document']
): Record<string, unknown> {
  const transformedProps: Record<string, unknown> = { ...props }

  Object.keys(props).forEach(propName => {
    const componentMetadata = moduleNameToComponentMetadata[moduleName][name]
    if (!componentMetadata.propShape) {
      return
    }
    const propType: PropType = componentMetadata.propShape[propName].type
    if (propType === 'StreamsTemplateString') {
      const templateString = props[propName]
      if (typeof templateString !== 'string') {
        console.error('StreamsTemplateString should be a string, found', typeof templateString)
        return
      }
      transformedProps[propName] = templateString.replaceAll(STREAMS_TEMPLATE_REGEX, (...args) => {
        return lodashGet({ document: streamDocument }, args[1]) ?? args[0]
      })
    } else if (propType === 'StreamsDataPath') {
      const dataPath = props[propName]
      if (typeof dataPath !== 'string') {
        console.error('StreamsDataPath should be a string, found', typeof dataPath)
        return
      }
      transformedProps[propName] = lodashGet({ document: streamDocument }, dataPath) ?? dataPath
    }
  })
  return transformedProps
}
