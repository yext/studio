import { registerListener } from "./registerListener";
import { ViteDevServer } from "vite";
import { MessageID, ResponseType } from "../types";
import ManagementApiService from "../http/ManagementApiService";
import { EntitiesRequest } from "../http/types/Entities";

/**
 * Registers a listener for getting entities from the account.
 */
export default function registerGetEntities(
  server: ViteDevServer,
  managementApiService: ManagementApiService
) {
  registerListener(
    server,
    MessageID.GetEntities,
    async (request: EntitiesRequest) => {
      try {
        const response = await managementApiService.getEntities(request);
        return {
          msg: "Successfully fetched entities.",
          type: ResponseType.Success,
          entities: response,
        };
      } catch {
        return {
          msg: "Error fetching entities.",
          type: ResponseType.Error,
        };
      }
    }
  );
}
