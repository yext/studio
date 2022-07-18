import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { MessageID, ResponseEventMap } from '../../shared/messages'
import 'react-toastify/dist/ReactToastify.css'

export default function Toast() {
  useEffect(() => {
    let isUnmounted = false
    const payloadHandler = (payload: ResponseEventMap[MessageID]) => {
      if (isUnmounted) return
      if (payload.type === 'error') {
        toast.error(payload.msg)
        console.error(payload.msg)
      } else {
        toast.success(payload.msg)
      }
    }
    import.meta.hot?.on(MessageID.UpdatePageComponentProps, payloadHandler)
    import.meta.hot?.on(MessageID.UpdateSiteSettingsProps, payloadHandler)
    return () => { isUnmounted = true }
  }, [])

  return (
    <ToastContainer autoClose={1000}/>
  )
}