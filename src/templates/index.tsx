import { SearchBar } from '@yext/search-ui-react'
import Banner from '../components/Banner'
import TestLayout from '../layouts/TestLayout'
import {
  Template,
  GetPath,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from '@yext/pages'
import '../index.css'

export const config: TemplateConfig = {
  stream: {
    $id: 'studio-stream-id',
    fields: ['id', 'address'],
    filter: {
      entityTypes: ['ce_person'],
    },
    localization: {
      locales: ['en'],
      primary: false,
    },
  },
}

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `people/${document.id.toString()}`
}

const IndexTemplate: Template<TemplateRenderProps> = ({ document }) => {
  return (
    <TestLayout>
      <Banner
        randomNum={document.address.city.bob}
        subtitleUsingStreams={`hi ${document.id}`}
        title='12312312'
        backgroundColor='#2f0a0a'
        someBool={true}
        anotherColor='#45de0d'
      />
      <Banner title='<Insert Title Here>' />
    </TestLayout>
  )
}

export default IndexTemplate
