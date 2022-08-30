/**
 * Given the current propValue, and the startIndex of the `${` for the expression
 * we're interested in, get the end index for this expression.
 */
export default function getExpressionEndIndex(propValue: string, startIndex: number) {
  const truncated = propValue.substring(startIndex)
  const whitespaceIndex = truncated.indexOf(' ')
  const closingBraceIndex = truncated.indexOf('}')
  const indexBeforeBacktik = truncated.length - 1
  const nonNegativeValues = [whitespaceIndex, closingBraceIndex, indexBeforeBacktik].filter(v => v >= 0)
  return startIndex + Math.min(...nonNegativeValues)
}