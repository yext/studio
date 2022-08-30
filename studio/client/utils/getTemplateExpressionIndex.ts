/**
 * Returns the index AFTER the last `${` style open brace that is still before the cursor selection.
 */
export default function getTemplateExpressionIndex(
  value: string,
  selectionStart: number
): number | null {
  const firstHalf = value.substring(0, selectionStart)
  const lastOpenBraceIndex = firstHalf.lastIndexOf('${')
  if (lastOpenBraceIndex < 0) {
    return null
  }
  const lastCloseBraceIndex = firstHalf.lastIndexOf('}')
  if (lastCloseBraceIndex >= 0 && lastCloseBraceIndex > lastOpenBraceIndex) {
    return null
  }
  return lastOpenBraceIndex + 2
}
