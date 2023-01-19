import SiteSettingSlice from './SiteSettingsSlice';

/**
 * Keeps track of the state of the application at the time of the last commit.
 * Currently only siteSettings is tracked here.
 */
export interface PreviousCommitSlice {
  siteSettings: Pick<SiteSettingSlice, 'values'>
}

export default PreviousCommitSlice;
