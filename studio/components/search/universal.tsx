import { UniversalProps } from '../../props/search/universal';
import { SearchBar } from '@yext/answers-react-components'
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';

export default function Universal(props: UniversalProps) {
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
        <SearchBar placeholder={props.searchBar?.placeholderText || 'Hey'}/>
      </AnswersHeadlessProvider>
    </div>
  )
}