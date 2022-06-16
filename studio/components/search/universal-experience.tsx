import { UniversalExperienceProps } from '../../props/search/universal-experience';
import { SearchBar, UniversalResults } from '@yext/answers-react-components'
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';

export default function UniversalExperience(props: UniversalExperienceProps) {
  const config = {
    apiKey: '2d8c550071a64ea23e263118a2b0680b',
    experienceKey: 'slanswers-hier-facets',
    locale: 'en',
    experienceVersion: 'STAGING',
    businessId: 123123
  };

  return (
    <div>
      <AnswersHeadlessProvider {...config}>
        <SearchBar placeholder={props.searchBar?.placeholderText}/>
        <UniversalResults verticalConfigMap={{}}/>
      </AnswersHeadlessProvider>
    </div>
  )
}