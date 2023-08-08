import { ViteDevServer } from "vite";
import FileSystemManager from "../FileSystemManager";
import { GetAllComponentFilepathsPayload, MessageID } from "../types";
import { registerListener } from "./registerListener";
import fs from "fs"

export default function getAllComponentFilepaths(
  server: ViteDevServer,
  fileManager: FileSystemManager,
) {
  registerListener(
    server,
    MessageID.GetAllComponentFilepaths,
    async ({} : GetAllComponentFilepathsPayload) => {
        const componentFiles = fs.readdirSync(fileManager.getUserPaths().components)
        return { type: "data", filepaths: componentFiles, msg: "Filepaths found successfully." };
    }
  );
}
