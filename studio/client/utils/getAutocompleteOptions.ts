import lodashGet from 'lodash/get.js'

/**
 * Returns the available autocomplete options (e.g. within site settings
 * configuration or stream document), given a certain value.
 */
export default function getAutocompleteOptions(
  value: string | undefined,
  optionsGroupedByParentPath: Record<string, Record<string, unknown>>,
): string[] {
  const parentPaths = Object.keys(optionsGroupedByParentPath)
  if (!value) {
    return parentPaths.map(p => `${p}.`)
  }
  let matchedParentPath = parentPaths.find(p => p.startsWith(value))
  if (matchedParentPath) {
    return [`${matchedParentPath}.`]
  }
  matchedParentPath = parentPaths.find(p => value.startsWith(`${p}.`))
  if (!matchedParentPath) {
    return []
  }
  const currentSuffix = value.split('.').pop() ?? ''
  const valParentPath = value.substring(0, value.lastIndexOf('.'))
  const options = optionsGroupedByParentPath[matchedParentPath]
  const optionsNode = lodashGet({ [matchedParentPath]: options }, value)
    ?? lodashGet({ [matchedParentPath]: options }, valParentPath)

  if (Array.isArray(optionsNode) || typeof optionsNode !== 'object') {
    return []
  }

  return Object.keys(optionsNode)
    .filter(d => d.startsWith(currentSuffix))
    .filter((_, i) => i < 10)
}
