import Banner from './components/Banner'
import TestLayout from './layouts/TestLayout'

export default function IndexPage() {
  return (
    <TestLayout>
      <Banner title='first!' randomNum={1} />
      <Banner />
      <Banner title='three' randomNum={3} someBool={false} />
    </TestLayout>
  )
}
