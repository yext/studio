import getAutocompleteOptions from './getAutocompleteOptions'

const options = {
  document: {
    hi: 123,
    bye: 'goodbye'
  },
  siteSettings: {
    hello: 'test',
    bob: 'name'
  }
}

it('does not return options when there are trailing periods', () => {
  expect(getAutocompleteOptions('document....', options)).toEqual([])
})

it('does not return options when value starts with unknown parent path', () => {
  expect(getAutocompleteOptions('pages.', options)).toEqual([])
})

it('returns site settings options when value starts with siteSettings', () => {
  expect(getAutocompleteOptions('siteSettings.', options)).toEqual(['hello', 'bob'])
})

it('returns stream document options when value starts with document', () => {
  expect(getAutocompleteOptions('document.', options)).toEqual(['hi', 'bye'])
})
