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
        subtitleUsingStreams={`my prefix ${document.id} my suffix`}
        randomNum={document.address.city}
      />
    </TestLayout>
  )
}

export default IndexTemplate
