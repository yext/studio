import prettier from 'prettier'

export function prettify(code: string) {
  return prettier.format(code, {
    parser: 'typescript',
    semi: false,
    singleQuote: true,
    jsxSingleQuote: true
  })
}
