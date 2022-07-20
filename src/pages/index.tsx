import { SearchBar } from '@yext/answers-react-components'
import Banner from '../components/Banner'
import Layout from '../layouts/layout'

export default function () {
  return (
    <Layout>
      <Banner title='first!' randomNum={1} />
      <Banner />
      <Banner
        title='three'
        randomNum={3}
        someBool={false}
        backgroundColor='#00ff00'
      />
      <SearchBar/>
    </Layout>
  )
}
