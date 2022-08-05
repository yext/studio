import parseNpmComponents from './parseNpmComponents'

// TODO(oshi): currently does not handle props that are not string | number | boolean
it('string matcher works', () => {
  const result = parseNpmComponents('@yext/search-ui-react', ['ApplyFiltersButton'])
  expect(result).toEqual({
    ApplyFiltersButton: {
      importIdentifier: expect.stringContaining('.ts'),
      initialProps: {},
      propShape: {
        label: {
          doc: expect.stringContaining('label for the button'),
          type: 'string'
        }
      }
    }
  })
})

it('works with regex matcher', () => {
  const result = parseNpmComponents('@yext/search-ui-react', [ /ApplyFiltersButton/ ])
  expect(result).toEqual({
    ApplyFiltersButton: {
      importIdentifier: expect.stringContaining('.ts'),
      initialProps: {},
      propShape: {
        label: {
          doc: expect.stringContaining('label for the button'),
          type: 'string'
        }
      }
    }
  })
})