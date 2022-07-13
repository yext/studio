import Banner from '../components/Banner'

export default function () {
  return (
    <>
      <Banner title='first!' randomNum={1} />
      <Banner />
      <Banner
        title='three'
        randomNum={3}
        someBool={false}
        backgroundColor='#00ff00'
      />
    </>
  )
}
