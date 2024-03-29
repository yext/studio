import { PluginOption } from "vite";
import isStyleFile from "./utils/isStyleFile";

/**
 * Adds the `?inline` query parameter to all CSS and SCSS imports
 * unless they are imported by Studio. Studio styling files are
 * distinguished by their `?studioStyling` query parameter.
 * This prevents user styling from affecting Studio's UI.
 */
export default function createStudioStylingPlugin(): PluginOption {
  return {
    name: "yext-studio-style-plugin",
    enforce: "pre",
    async resolveId(id, importer) {
      if (!importer) {
        return;
      }
      if (isImportedByStudio(id)) {
        return;
      }
      if (isStyleId(id)) {
        const resolvedId = (
          await this.resolve(id, importer, { skipSelf: true })
        )?.id;
        if (resolvedId) {
          return addQueryParameter(resolvedId, "inline");
        }
        throw new Error(
          `Styling file ${id} could not be resolved by yext-studio-style-plugin. ` +
            `File was imported by ${importer}.`
        );
      }
    },
  };
}

function isImportedByStudio(id: string) {
  return includesQueryParameter(id, "studioStyling");
}

function isStyleId(id: string) {
  const idWithoutQueryParams = id.split("?")[0];
  return isStyleFile(idWithoutQueryParams);
}

function addQueryParameter(id: string, queryParameter: string) {
  if (includesQueryParameter(id, queryParameter)) {
    return id;
  }
  const joinCharacter = id.includes("?") ? "&" : "?";
  return `${id}${joinCharacter}${queryParameter}`;
}

function includesQueryParameter(id: string, queryParam: string) {
  return !!id.match(new RegExp(`.*\\?(.*&)?${queryParam}(&.*)?$`));
}
