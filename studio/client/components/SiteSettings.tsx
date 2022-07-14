import { useState } from 'react'
import { MessageID } from '../../shared/messages'
import { PropState, TSPropShape } from '../../shared/models'
import sendMessage from '../messaging/sendMessage'
import PropEditor from './PropEditor'

export interface SiteSettingsProps {
  propShape: TSPropShape,
  propState: PropState
}

export default function SiteSettings(props: SiteSettingsProps) {
  const { propShape, propState } = props
  const [siteSettingsState, setSiteSettingsState] = useState(propState)

  return (
    <div>
      <h1 className='text-2xl text-white'>Site Settings</h1>
      <PropEditor
        propShape={propShape}
        propState={siteSettingsState}
        setPropState={setSiteSettingsState}
      />
      <button className='btn' onClick={() => sendMessage(MessageID.UpdateSiteSettingsProps, {
        path: 'src/siteSettings.ts',
        state: siteSettingsState
      })}>
        Save
      </button>
    </div>
  )
}