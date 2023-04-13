import { HmrContext } from "vite";
import HmrManager from "./HmrManager";

/**
 * Factory method for creating our handleHotUpdate handler.
 */
export default function createHandleHotUpdate(hmrManager: HmrManager) {
  return async function (ctx: HmrContext) {
    // console.log('handle hot update isnta return', ctx.modules.length)
    // return
    const reloadModulePromises = ctx.modules.map((m) => {
      return ctx.server.reloadModule(m);
    });
    await Promise.all(reloadModulePromises);
    // hmrManager.handleHotUpdate(ctx.server, ctx.file);
  };
}
