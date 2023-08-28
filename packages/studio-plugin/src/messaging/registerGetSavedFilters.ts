import { registerListener } from "./registerListener";
import { ViteDevServer } from "vite";
import { MessageID, ResponseType } from "../types";
import ManagementApiService from "../http/ManagementApiService";

/**
 * Registers a listener for getting all saved filters from the account.
 */
export default function registerGetSavedFilters(
  server: ViteDevServer,
  managementApiService: ManagementApiService
) {
  registerListener(server, MessageID.GetSavedFilters, async () => {
    try {
      const response = await managementApiService.getSavedFilters();
      return {
        msg: "Successfully fetched saved filters.",
        type: ResponseType.Success,
        savedFilters: response,
      };
    } catch (e) {
      console.error(e);
      return {
        msg: "Error fetching saved filters.",
        type: ResponseType.Error,
      };
    }
  });
}
