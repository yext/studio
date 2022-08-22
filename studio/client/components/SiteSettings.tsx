import { useState } from 'react'
import { MessageID } from '../../shared/messages'
import { ComponentMetadata, PropState } from '../../shared/models'
import sendMessage from '../messaging/sendMessage'
import PropEditor from './PropEditor'
import { useStudioContext } from './useStudioContext'

export interface SiteSettingsProps {
  componentMetadata: ComponentMetadata,
  propState: PropState
}

export default function SiteSettings() {
  const { componentMetadata, propState } = useStudioContext().siteSettings
  const [siteSettingsState, setSiteSettingsState] = useState(propState)

  return (
    <div>
      <h1 className='text-2xl text-white'>Site Settings</h1>
      <PropEditor
        componentMetadata={componentMetadata}
        propState={siteSettingsState}
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