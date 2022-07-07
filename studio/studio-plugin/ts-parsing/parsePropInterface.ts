import { parse } from '@typescript-eslint/typescript-estree'
import fs from 'fs'
import getRootPath from '../getRootPath'

// TODO Currently only supports TSStringKeyword TSNumberKeyword TSBooleanKeyword and is hardcoded to Banner.tsx
// TODO use ts-morph instead.
export default function parsePropInterface() {
  const file = fs.readFileSync(getRootPath('src/components/Banner.tsx')).toString()
  const p = parse(file, { jsx: true })
  // @ts-ignore
  const exportInterface = p.body.find(n => n?.declaration?.id?.name === 'BannerProps')
  // @ts-ignore
  const props = exportInterface.declaration.body.body
  const propShape = {}
  for (const propSignature of props) {
    const name = propSignature.key.name
    const type = propSignature.typeAnnotation.typeAnnotation.type
    propShape[name] = type
  }
  console.log(propShape)
  return propShape
}