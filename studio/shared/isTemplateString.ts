export function isTemplateString(value: unknown): value is `\`${string}\`` {
  if (typeof value !== 'string') {
    return false
  }
  return value.startsWith('`') && value.endsWith('`') && value.length >= 2
}
