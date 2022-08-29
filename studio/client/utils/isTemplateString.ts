export default function isTemplateString(value: string): boolean {
  return value.startsWith('`') && value.endsWith('`') && value.length >= 2
}
