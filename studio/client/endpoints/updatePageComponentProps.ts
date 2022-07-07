import { PageComponentsState } from '../../shared/models'
import MessageIDs from '../../shared/MessageIDs'

export default function updatePageComponentProps(
  updatedState: PageComponentsState
) {
  import.meta.hot?.send(MessageIDs.UpdatePageComponentProps, updatedState)
}