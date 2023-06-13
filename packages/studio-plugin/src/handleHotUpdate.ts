import { HmrContext } from "vite";
import HmrManager from "./HmrManager.js";

/**
 * Factory method for creating our handleHotUpdate handler.
 */
export default function createHandleHotUpdate(hmrManager: HmrManager) {
  return async function (ctx: HmrContext) {
    const reloadModulePromises = ctx.modules.map((m) => {
      return ctx.server.reloadModule(m);
    });
    await Promise.all(reloadModulePromises);
    hmrManager.handleHotUpdate(ctx.server, ctx.file);
  };
}
