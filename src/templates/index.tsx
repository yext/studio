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
import Footer, { globalProps as footerProps } from '../components/Footer.global'
import Header, { globalProps as headerProps } from '../components/Header.global'
import Card from '../components/Card'

export const config: TemplateConfig = {
  stream: {
    $id: 'studio-stream-id',
    filter: { entityTypes: ['ce_person'] },
    localization: { locales: ['en'], primary: false },
    fields: ['address.city.bob', 'emails', 'lastName'],
  },
}

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `people/${document.id.toString()}`
}

const IndexTemplate: Template<TemplateRenderProps> = ({ document }) => {
  return (
    <TestLayout>
      <Header {...headerProps} />
      <Card bgColor='#45de0d'>
        <Card bgColor='#abcdef'>
          <Card/>
        </Card>
      </Card>
      <Banner
        randomNum={document.address.city.bob}
        subtitleUsingStreams={document.id}
        title='12312312'
        backgroundColor='#b75c5c'
        someBool={true}
        anotherColor='#45de0d'
      />
      <Banner
        title='custom title'
        randomNum={document.emails[1]}
        subtitleUsingStreams={`${document.lastName}`}
        someBool={true}
        anotherColor='#9c8181'
      />
      <Footer {...footerProps} />
      <Footer {...footerProps} />
    </TestLayout>
  )
}

export default IndexTemplate
