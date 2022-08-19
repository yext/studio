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
    filter: { entityTypes: ['ce_person'] },
    localization: { locales: ['en'], primary: false },
    fields: [
      'document.address.city.bob',
      'document.emails',
      'document.lastName',
    ],
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
        subtitleUsingStreams={document.id}
        title='12312312'
        backgroundColor='#b75c5c'
        someBool={true}
        anotherColor='#45de0d'
      />
      <Banner
        title='<Insert Titl2'
        randomNum={document.emails[1]}
        subtitleUsingStreams={`${document.lastName}`}
        someBool={true}
        anotherColor='#9c8181'
      />
    </TestLayout>
  )
}

export default IndexTemplate
