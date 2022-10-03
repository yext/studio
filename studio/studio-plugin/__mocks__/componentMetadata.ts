import { ModuleNameToComponentMetadata } from '../../shared/models'
import { PropTypes } from '../../types'

export const moduleNameToComponentMetadata: ModuleNameToComponentMetadata = {
  builtIn: { components: {} },
  localLayouts: { components: {} },
  localComponents: {
    components: {
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
            type: PropTypes.string
          },
          streamsString: {
            type: PropTypes.string
          },
          subtitleUsingStreams: {
            type: PropTypes.string
          }
        },
      }
    }
  }
}