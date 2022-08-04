import { SearchBar } from '@yext/answers-react-components'
import Banner from '../components/Banner'
import Layout from '../layouts/layout'

export default function ({ document }) {
  return (
    <Layout>
      <Layout />
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
      <SearchBar />
    </Layout>
  )
}
