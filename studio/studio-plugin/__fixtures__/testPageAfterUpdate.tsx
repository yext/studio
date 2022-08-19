import Banner, {
  BannerProps,
  defaultClassNames as RenamedImportedClassNames,
} from './components/Banner'
import { ColorProp } from './components/SpecialProps'

export default function IndexPage() {
  return (
    <>
      <Banner title='first!' randomNum={1} />
      <Banner title='two' randomNum={2} someBool={true} />
    </>
  )
}
