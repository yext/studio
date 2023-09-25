import { ViteDevServer } from "vite";
import VirtualModuleID from "../VirtualModuleID";
import GitWrapper from "./GitWrapper";
import { GitDataHMRUpdateID } from "../types";

export default async function reloadGitData(
  gitWrapper: GitWrapper,
  server: ViteDevServer
) {
  await gitWrapper.refreshData();
  const gitDataModule = server.moduleGraph.getModuleById(
    "\0" + VirtualModuleID.GitData
  );
  if (!gitDataModule) {
    throw new Error("Expected a GitData module.");
  }
  server.moduleGraph.invalidateModule(gitDataModule);
  server.ws.send({
    type: "custom",
    event: GitDataHMRUpdateID,
    data: gitWrapper.getStoredData(), 
  });
}
