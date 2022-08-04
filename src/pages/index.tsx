import { SearchBar } from '@yext/answers-react-components'
import Banner from '../components/Banner'
import Layout from '../layouts/layout'

/**
 * Currently unused, but here for reference.
 * eventually these need to be combined across pages into a features.json
 */
export const config = {
  // should this be user settable? I assume we can auto-gen
  $id: 'studio-stream-id',
  // need to update the fields to only include the ones a user uses
  // currently we rely on the -a flag for local testing
  fields: [],
  filter: {
    // somehow we also need to know the entity type
    entityTypes: ['ce_person'],
  },
  // localization can be hardcoded to this for now, not sure what "primary" does though.
  localization: {
    locales: ['en'],
    primary: false,
  },
}

export default function ({ document }) {
  return (
    <Layout>
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
    </Layout>
  )
}
