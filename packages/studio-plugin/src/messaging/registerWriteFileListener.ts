import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { GetComponentFilePayload, MessageID, WriteFilePayload } from "../types";
import { registerListener } from "./registerListener";
import fs from "fs"

export default function registerWriteFileListener(
  server: ViteDevServer,
  fileManager: FileSystemManager,
) {
  registerListener(
    server,
    MessageID.WriteFile,
    async ({filepath, dataToWrite}: WriteFilePayload) => {
        console.log("registerWriteFileListener running")
        let file = ""
        if (fs.existsSync(fileManager.getUserPaths().components + "/" + filepath)) {
            file = fs.readFileSync(fileManager.getUserPaths().components + "/" + filepath).toString()
        }

        fs.writeFileSync(fileManager.getUserPaths().components + "/" + filepath, dataToWrite)
        return { type: "success", msg: "File written successfully.", originalFile: file};
    }
  );
}
