import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { GetComponentFilePayload, MessageID } from "../types";
import { registerListener } from "./registerListener";
import fs from "fs"

export default function getComponentFile(
  server: ViteDevServer,
  fileManager: FileSystemManager,
) {
  registerListener(
    server,
    MessageID.GetComponentFile,
    async ({filepath}: GetComponentFilePayload) => {
        const file = fs.readFileSync(fileManager.getUserPaths().components + "/" + filepath).toString()
        console.log("file here", file)
        return { file: file, type: "data", msg: "Changes written successfully." };
    }
  );
}
