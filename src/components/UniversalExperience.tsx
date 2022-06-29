import { SearchBar, UniversalResults } from '@yext/answers-react-components'
import { AnswersHeadlessProvider } from '@yext/answers-headless-react';
import answersConfig from '../siteSettings';

export interface UniversalExperienceProps {
  searchBar?: {
    placeholderText?: string
  },
  universalResults?: {
    showAppliedFilters?: boolean
  }
}

export default function UniversalExperience(props: UniversalExperienceProps) {
  return (
    <div>
      <AnswersHeadlessProvider {...answersConfig}>
        <SearchBar placeholder={props.searchBar?.placeholderText}/>
        <UniversalResults verticalConfigMap={{}} showAppliedFilters={props.universalResults?.showAppliedFilters}/>
      </AnswersHeadlessProvider>
    </div>
  )
}