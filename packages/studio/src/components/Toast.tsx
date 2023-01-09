import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import useMessageListener from "../hooks/useMessageListener";
import { MessageID } from "@yext/studio-plugin";
import { useCallback } from "react";

export default function Toast() {
  const listenerCallback = useCallback((payload) => {
    if (payload.type === "error") {
      toast.error(payload.msg);
    } else {
      toast.success(payload.msg);
    }
  }, []);
  useMessageListener(MessageID.StudioCommitChanges, listenerCallback);

  return <ToastContainer autoClose={1000} />;
}
