import Banner, {
  BannerProps,
  defaultClassNames as RenamedImportedClassNames,
} from './components/Banner'
import { ColorProp } from './components/SpecialProps'
import siteSettings from './siteSettings'

export default function IndexPage() {
  return (
    <>
      <Banner title={siteSettings.apiKey} />
      <Banner title='two' randomNum={2} someBool={true} />
    </>
  )
}
