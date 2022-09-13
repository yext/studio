import { ModuleNameToComponentMetadata } from '../../shared/models'
import { PropTypes } from '../../types'

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  localLayouts: {},
  localComponents: {
    Card: {
      global: false,
      acceptsChildren: true,
      editable: true,
      importIdentifier: './components/Bard',
      propShape: {
        bgColor: {
          type: PropTypes.HexColor
        }
      }
    },
    Banner: {
      global: false,
      acceptsChildren: false,
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