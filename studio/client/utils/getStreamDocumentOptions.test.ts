import getStreamDocumentOptions from './getStreamDocumentOptions'

it('does not return options when there are trailing periods', () => {
  const streamDocument = {
    hi: 123
  }
  expect(getStreamDocumentOptions('document....', streamDocument)).toEqual([])
})