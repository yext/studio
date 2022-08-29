export default function isTemplateString(value: string | undefined): value is `\`${string}\`` {
  if (typeof value !== 'string') {
    return false
  }
  return value.startsWith('`') && value.endsWith('`') && value.length >= 2
}
