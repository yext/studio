import { ViteDevServer } from "vite";
import GitWrapper from "../git/GitWrapper";
import { MessageID } from "../types";
import { registerListener } from "./registerListener";

export default function registerSaveChangesListener(
  server: ViteDevServer
) {
  registerListener(
    server,
    MessageID.CanPush,
    async () => {
      const res = GitWrapper.canPush()
      return {
        msg: 'Success!',
        res: {
          canPush: res.canPush
        }
      }
    }
  );
}
