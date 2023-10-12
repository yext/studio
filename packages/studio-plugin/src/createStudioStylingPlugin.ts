import { PluginOption } from "vite";
/**
 * Adds the ?inline query parameter to all CSS imports
 * unless they are CSS from Studio, which is determined
 * from the path of its importer. This prevents user styling
 * from affecting Studio UI.
 */
export default function createStudioStylingPlugin(): PluginOption {
  return {
    name: "yext-studio-style-plugin",
    enforce: "pre",
    async resolveId(id, importer) {
      if (!importer) {
        return;
      }
      if (isImportedByStudio(importer)) {
        return;
      }
      if (isStyleFile(id)) {
        const resolvedId = (
          await this.resolve(id, importer, { skipSelf: true })
        )?.id;
        if (resolvedId) {
          return addQueryParameter(resolvedId, "inline");
        }
        throw new Error(
          "Styling file could not be resolved by yext-studio-style-plugin"
        );
      }
    },
  };
}

function isImportedByStudio(id: string) {
  return !!(id.match(/.*@yext\/studio.*/) || id.match(/.*packages\/studio*/));
}

function isStyleFile(id: string) {
  return !!id.match(/.*\.s?css.*/);
}

function addQueryParameter(id: string, queryParameter: string) {
  if (id.match(new RegExp(`.*?.*${queryParameter}`))) {
    return id;
  }
  const joinCharacter = id.includes("?") ? "&" : "?";
  return `${id}${joinCharacter}${queryParameter}`;
}
