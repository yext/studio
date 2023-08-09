import { ViteDevServer } from "vite";
import { GetCompletionPayload, MessageID } from "../types";
import { registerListener } from "./registerListener";
import { callCodeBison } from "../vertex/generateCode";

export default function getComponentFile(
  server: ViteDevServer,
) {
  registerListener(
    server,
    MessageID.GetCodeCompletion,
    async ({prompt}: GetCompletionPayload) => {
        const res = await callCodeBison(prompt)
        return { file: res.structValue.fields.content.stringValue, metadata: res, type: "data", msg: "Changes written successfully." };
    }
  );
}
