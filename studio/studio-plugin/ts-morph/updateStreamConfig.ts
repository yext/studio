import { TemplateConfig } from '@yext/pages/*'
import { PageState, ComponentState } from '../../shared/models'
import { moduleNameToComponentMetadata } from '../componentMetadata'
import { v1 } from 'uuid'

const INFRASTRUCTURE_STREAM_PROPERTIES = [
  '__',
  'businessId',
  'id',
  'key',
  'locale',
  'meta',
  'siteDomain',
  'siteId',
  'siteInternalHostName',
  'uid'
]

export default function updateStreamConfig(
  componentsState: ComponentState[],
  currentConfig: TemplateConfig
): TemplateConfig {
  const fields: string[] = ['id']
  componentsState.map(c => {
    const shape = 123
  })
  return {
    ...currentConfig,
    stream: {
      $id: 'studio-stream-id_' + v1(),
      filter: {},
      localization: {
        locales: ['en'],
        primary: false,
      },
      ...currentConfig.stream,
      fields
    }
  }
  
  
}