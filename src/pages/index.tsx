import UniversalExperience from '../components/UniversalExperience';
import '@yext/answers-react-components/bundle.css';
import { Banner } from '../components/Banner';

export default function() {
  return (
    <>
      <Banner {...{
        title: 'banner title!'
      }}/>
      <UniversalExperience {...{

      }}/>
    </>
  );
}