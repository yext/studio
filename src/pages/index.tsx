import { Banner } from '../components/Banner';

export default function() {
  return (
    <>
      <Banner title='banner title!' randomNum={3}/>
      <Banner title='banner title!' randomNum={123}></Banner>
      <Banner/>
    </>
  );
}