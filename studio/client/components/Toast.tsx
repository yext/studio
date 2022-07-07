import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { ClientDisplayToastID } from '../../shared/MessageIDs';
export default function Toast() {
  useEffect(() => {
    import.meta.hot?.on(ClientDisplayToastID, (payload: string) => {
      toast(payload);
    });
  }, []);

  return (
    <ToastContainer autoClose={1000}/>
  )
}