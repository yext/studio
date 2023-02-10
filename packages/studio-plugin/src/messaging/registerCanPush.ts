import { SimpleGit, simpleGit } from "simple-git";
import { ViteDevServer } from "vite";
import { MessageID } from "../types";
import { registerListener } from "./registerListener";

export default function registerSaveChangesListener(
  server: ViteDevServer
) {
  const git: SimpleGit = simpleGit();
  registerListener(
    server,
    MessageID.CanPush,
    async () => {
      const remotes = await git.getRemotes()
      console.log(remotes)
      return {
        msg: "Success.",
        res: {
          canPush: true,
        }
      };
    }
  );
}
