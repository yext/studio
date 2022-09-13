import Header, { BannerProps as HeaderProps } from './Banner'
import siteSettings from '../siteSettings'

export const globalProps: HeaderProps = {
  title: siteSettings.experienceVersion,
}

export default Header
