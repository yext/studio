import { registerListener } from "./registerListener";
import { ViteDevServer } from "vite";
import { MessageID, ResponseType } from "../types";
import ManagementApiService from "../http/ManagementApiService";

/**
 * Registers a listener for getting all enabled entity types from the account.
 */
export default function registerGetEntityTypes(
  server: ViteDevServer,
  managementApiService: ManagementApiService
) {
  registerListener(server, MessageID.GetEntityTypes, async () => {
    try {
      const response = await managementApiService.getEnabledEntityTypes();
      return {
        msg: "Successfully fetched entity types.",
        type: ResponseType.Success,
        entityTypes: response,
      };
    } catch {
      return {
        msg: "Error fetching entity types.",
        type: ResponseType.Error,
      };
    }
  });
}
