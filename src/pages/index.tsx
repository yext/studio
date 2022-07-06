import Banner from '../components/Banner';
// import Layout from '../layouts/layout';

export default function() {
  return (
    <>
      <Banner title='first!23123' randomNum={1}/>
      <Banner/>
      <Banner title='three' randomNum={3} someBool={false}></Banner>
    </>
  );
}