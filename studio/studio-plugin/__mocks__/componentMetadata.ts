import { ModuleNameToComponentMetadata } from '../../shared/models'
import { PropTypes } from '../../types'

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  localLayouts: {},
  localComponents: {
    Banner: {
      editable: true,
      importIdentifier: './components/Banner',
      propShape: {
        title: {
          type: PropTypes.string,
        },
        randomNum: {
          type: PropTypes.number,
        },
        someBool: {
          type: PropTypes.boolean
        },
        streamsData: {
          type: PropTypes.StreamsData
        },
        streamsString: {
          type: PropTypes.StreamsString
        },
        subtitleUsingStreams: {
          type: PropTypes.StreamsString
        }
      },
    }
  }
}