import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { MessageID } from '../../shared/messages'
import 'react-toastify/dist/ReactToastify.css'

export default function Toast() {
  useEffect(() => {
    let isUnmounted = false;
    import.meta.hot?.on(MessageID.UpdatePageComponentProps, (payload: string) => {
      if (isUnmounted) return
      toast(payload)
    })
    return () => { isUnmounted = true }
  }, [])

  return (
    <ToastContainer autoClose={1000}/>
  )
}