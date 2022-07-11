import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { MessageID, ResponseEventMap } from '../../shared/messages'
import 'react-toastify/dist/ReactToastify.css'

export default function Toast() {
  useEffect(() => {
    const msgId = MessageID.UpdatePageComponentProps
    let isUnmounted = false;
    import.meta.hot?.on(msgId, (payload: ResponseEventMap[typeof msgId]) => {
      if (isUnmounted) return

      if (payload.type === 'error') {
        toast.error(payload.msg)
        console.error(payload.msg)
      } else {
        toast.success(payload.msg)
      }
    })
    return () => { isUnmounted = true }
  }, [])

  return (
    <ToastContainer autoClose={1000}/>
  )
}