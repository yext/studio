import upath from "upath"
import { PluginOption } from "vite";
/**
 * Adds the ?inline query parameter to all CSS imports
 * unless they are CSS from Studio, which are 
 * imported with the `?studioCss` query parameter. This 
 * prevents user styling from affecting Studio UI.
 */
export default function createStudioStylingPlugin(): PluginOption {
  return {
    name: "yext-studio-style-plugin",
    enforce: "pre",
    resolveId(id, importer) {
      if (!importer) {
        return
      }
      if (isStudioCss(id)) {
        return;
      }
      if (isStyleFile(id)) {
        if (upath.isAbsolute(id)) {
          return addQueryParameter(id, "inline")
        }
        return upath.join(upath.dirname(importer), addQueryParameter(id, "inline"))
      }
    },
  };
};

function isStudioCss(id: string) {
  return !!id.match(/.*\?.*studioCss.*/)
}

function isStyleFile(id: string) {
  return !!id.match(/.*\.s?css.*/);
}

function addQueryParameter(id: string, queryParameter: string) {
  if (id.match(new RegExp(`.*?.*${queryParameter}`))) {
    return id
  }
  const joinCharacter = id.includes("?") ? "&" : "?"
  return `${id}${joinCharacter}${queryParameter}`
}