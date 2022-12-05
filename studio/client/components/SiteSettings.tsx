import { MessageID } from '../../shared/messages'
import { ComponentMetadata, PropState } from '../../shared/models'
import sendMessage from '../messaging/sendMessage'
import PropEditor from './PropEditor'
import { useStudioStore } from './Studio'
// import { useSiteSettingsStore } from './Studio'
import { useStudioContext } from './useStudioContext'

export interface SiteSettingsProps {
  componentMetadata: ComponentMetadata,
  propState: PropState
}

export default function SiteSettings() {
  // const { siteSettingsMetadata, siteSettingsState, setSiteSettingsState } = useStudioContext()

  const [siteSettingsState, setSiteSettingsState] =
    useStudioStore(state => [state.siteSettings.state, state.siteSettings.setState])
  const siteSettingsMetadata = useStudioStore(state => state.siteSettings.metadata)
  return (
    <div>
      <h1 className='text-2xl text-white'>Site Settings</h1>
      <PropEditor
        componentMetadata={{
          importIdentifier: '', global: false, editable: true, acceptsChildren: false, ...siteSettingsMetadata,
        }}
        propState={siteSettingsState ?? {}}
        setPropState={setSiteSettingsState}
      />
      <button
        className='btn'
        onClick={() => {
          sendMessage(MessageID.UpdateSiteSettingsProps, {
            path: 'src/siteSettings.ts',
            state: siteSettingsState
          })
        }}
      >
        Save
      </button>
    </div>
  )
}