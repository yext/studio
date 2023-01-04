import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import useMessageListener from '../hooks/useMessageListener'
import { MessageID } from '@yext/studio-plugin'

export default function Toast() {
  useMessageListener(MessageID.StudioCommitChanges, (payload) => {
    if (payload.type === 'error') {
      toast.error(payload.msg)
    } else {
      toast.success(payload.msg)
    }
  })

  return (
    <ToastContainer autoClose={1000}/>
  )
}