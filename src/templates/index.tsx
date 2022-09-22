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
import siteSettings from '../siteSettings'

export const config: TemplateConfig = {
  stream: {
    $id: 'studio-stream-id',
    filter: { entityTypes: ['ce_person'] },
    localization: { locales: ['en'], primary: false },
    fields: ['address.city', 'emails', 'lastName'],
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
        <Card bgColor='#ffeeff'>
          <Card bgColor='#eeffbb' />
        </Card>
        <Card bgColor='#abcdef' />
        <Card bgColor='#fafafa' />
        <Card bgColor='#abcdef' />
      </Card>
      <Banner
        randomNum={100}
        streamData={document.address.city}
        subtitleUsingStreams={document.id}
        title={siteSettings.experienceKey}
        backgroundColor='#b75c5c'
        someBool={true}
        anotherColor='#45de0d'
      />
      <Banner
        title='custom title'
        randomNum={1}
        streamData={document.emails[0]}
        subtitleUsingStreams={`${document.lastName} test ${siteSettings.experienceVersion}`}
        someBool={true}
        anotherColor='#9c8181'
      />
      <Footer {...footerProps} />
      <Footer {...footerProps} />
    </TestLayout>
  )
}

export default IndexTemplate
