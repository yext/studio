import { ModuleNameToComponentMetadata, PageComponentsState, PropType } from '../../shared/models'
import lodashGet from 'lodash/get'
import { TemplateProps } from '@yext/pages'

export default function getPreviewProps(
  { moduleName, props, name }: PageComponentsState[number],
  moduleNameToComponentMetadata: ModuleNameToComponentMetadata,
  streamDocument: TemplateProps['document']
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
