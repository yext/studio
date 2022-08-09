import { Fragment } from 'react'
import Banner from './components/Banner'

export default function IndexPage() {
  return (
    <Fragment>
      <Banner title='first!' randomNum={1} />
      <Banner />
      <Banner title='three' randomNum={3} someBool={false} />
    </Fragment>
  )
}
