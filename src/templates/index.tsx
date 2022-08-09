import { SearchBar } from '@yext/search-ui-react'
import Banner from '../components/Banner'
import TestLayout from '../layouts/TestLayout'
import {
  Template,
  GetPath,
  TemplateConfig,
  TemplateProps,
  TemplateRenderProps,
} from "@yext/pages";
import '../index.css'

export const config: TemplateConfig = {
  stream: {
    $id: 'studio-stream-id',
    fields: ["id", "address"],
    filter: {
      entityTypes: ['ce_person'],
    },
    localization: {
      locales: ['en'],
      primary: false,
    },
  }
}

export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `people/${document.id.toString()}`;
};

const IndexTemplate: Template<TemplateRenderProps> = ({ document }) => {
  return (
    <TestLayout>
      <Banner subtitleUsingStreams={`hi ${document.id} ${document.address}`} />
      <Banner title='12312312' />
      <Banner
        title='first!123u1o2i3u1'
        randomNum={1}
        subtitleUsingStreams={`hi ${document.title}`}
        backgroundColor='#6d1212'
      />
      <Banner
        title='three'
        randomNum={3}
        someBool={false}
        backgroundColor='#00ff00'
      />
      <SearchBar />
    </TestLayout>
  )
}

export default IndexTemplate