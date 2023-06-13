import { ViteDevServer } from "vite";
import VirtualModuleID from "../VirtualModuleID.js";
import GitWrapper from "./GitWrapper.js";

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
}
