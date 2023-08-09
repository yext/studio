import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { GetCodeCompletionPayload, MessageID } from "../types";
import { registerListener } from "./registerListener";
import { callPredict } from "../vertex/testCodeCreate";

export default function getComponentFile(
  server: ViteDevServer,
) {
  registerListener(
    server,
    MessageID.GetCodeCompletion,
    async ({prompt}: GetCodeCompletionPayload) => {
        const res = await callPredict(prompt)
        return { file: res.structValue.fields.content.stringValue, metadata: res, type: "data", msg: "Changes written successfully." };
    }
  );
}
