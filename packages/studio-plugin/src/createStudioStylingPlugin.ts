import { PluginOption } from "vite";
import upath from "upath";
import { fileURLToPath } from "url";
const currentDir = upath.dirname(fileURLToPath(import.meta.url));
const packagesDir = upath.resolve(currentDir, "../..");

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

function isImportedByStudio(importer: string) {
  const unixImporter = upath.toUnix(importer);
  return !!(
    unixImporter.match(/.*\/node_modules\/@yext\/studio.*/) ||
    importer.startsWith(packagesDir)
  );
}

function isStyleFile(id: string) {
  const idWithoutQueryParams = id.split("?")[0]
  return !!idWithoutQueryParams.endsWith(".css");
}

function addQueryParameter(id: string, queryParameter: string) {
  if (id.match(new RegExp(`.*\\?(.*&)?${queryParameter}`))) {
    return id;
  }
  const joinCharacter = id.includes("?") ? "&" : "?";
  return `${id}${joinCharacter}${queryParameter}`;
}
