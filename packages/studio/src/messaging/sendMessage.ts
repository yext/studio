import {
  FatalErrorResponse,
  MessageID,
  ResponseEventMap,
  ResponseType,
  StudioEventMap,
} from "@yext/studio-plugin";
import { toast } from "react-toastify";

/**
 * Send a message to the backend, e.g. to save changes to file or deploy changes.
 *
 * @returns A Promise that will be resolved once a response is received from the server.
 */
export default async function sendMessage<T extends MessageID>(
  messageId: T,
  payload: StudioEventMap[T]
): Promise<ResponseEventMap[T]> {
  const response = await fetch(window.location.href + messageId, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const responseData: ResponseEventMap[T] | FatalErrorResponse =
    await response.json();
  if (responseData.type === ResponseType.Fatal) {
    toast.error(responseData.msg);
    throw new Error(responseData.msg);
  }
  if (responseData.type === ResponseType.Success) {
    toast.success(responseData.msg);
  }
  return responseData;
}
