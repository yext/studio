import { useMemo } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { MessageID } from '../../shared/messages'
import 'react-toastify/dist/ReactToastify.css'
import useMessageListener from './useMessageListener'

export default function Toast() {
  const listenerOpts = useMemo(() => ({
    onSuccess: payload => toast.success(payload.msg),
    onError: payload => toast.error(payload.msg)
  }), [])
  useMessageListener(MessageID.UpdatePageComponentProps, listenerOpts)
  useMessageListener(MessageID.UpdateSiteSettingsProps, listenerOpts)

  return (
    <ToastContainer autoClose={1000}/>
  )
}