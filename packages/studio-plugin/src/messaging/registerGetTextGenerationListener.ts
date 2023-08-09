import { ViteDevServer } from "vite";
import { GetCompletionPayload, MessageID } from "../types";
import { registerListener } from "./registerListener";
import { callTextBison } from "../vertex/generateText"

export default function registerGetTextGenerationListern(
  server: ViteDevServer,
) {
  registerListener(
    server,
    MessageID.GetTextGeneration,
    async ({prompt}: GetCompletionPayload) => {
        const res = await callTextBison(prompt)
        return { file: res.structValue.fields.content.stringValue, metadata: res, type: "data", msg: "Changes written successfully." };
    }
  );
}
