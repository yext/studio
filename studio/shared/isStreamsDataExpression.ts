import { StreamsDataExpression } from '../types'

export function isStreamsDataExpression(
  value: string
): value is StreamsDataExpression {
  return value.startsWith('document.')
}