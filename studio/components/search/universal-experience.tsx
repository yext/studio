import { SearchBar, UniversalResults } from '@yext/answers-react-components'
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';

export interface UniversalExperienceProps {
  searchBar?: {
    placeholderText?: string
  },
  universalResults?: {
    showAppliedFilters?: boolean
  }
}

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
        <UniversalResults verticalConfigMap={{}} showAppliedFilters={props.universalResults?.showAppliedFilters}/>
      </AnswersHeadlessProvider>
    </div>
  )
}