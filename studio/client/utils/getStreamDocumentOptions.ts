import lodashGet from 'lodash/get.js'

/**
* Returns the available stream document autocomplete options, given a certain value.
*/
export default function getStreamDocumentOptions(
  value: string | undefined,
  streamDocument: Record<string, any>
): string[] {
  if (!value || 'document'.startsWith(value)) {
    return ['document.']
  } else if (!value.startsWith('document.')) {
    return []
  }
  const currentSuffix = value.split('.').pop() ?? ''
  const parentPath = value.substring(0, value.lastIndexOf('.'))
  const documentNode = lodashGet({ document: streamDocument }, value)
    ?? lodashGet({ document: streamDocument }, parentPath)

  if (Array.isArray(documentNode) || typeof documentNode !== 'object') {
    return []
  }

  return Object.keys(documentNode)
    .filter(d => d.startsWith(currentSuffix))
    .filter((_, i) => i < 10)
}
