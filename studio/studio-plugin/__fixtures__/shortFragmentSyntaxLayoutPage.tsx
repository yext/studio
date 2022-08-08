import Banner from './components/Banner'

export default function IndexPage() {
  return (
    <>
      <Banner title='first!' randomNum={1}></Banner>
      <Banner />
      <Banner title='three' randomNum={3} someBool={false} />
    </>
  )
}
