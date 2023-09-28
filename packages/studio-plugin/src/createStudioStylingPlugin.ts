import { PluginOption } from "vite";
import upath from "upath";

/**
 * Handles placing custom-labeled style tags to Studio HTML
 * by injecting query information into vite's "data-vite-dev-id"
 * attribute on styletags.
 *
 * This is used to identify which styles are to be added to the
 * Studio preview window depending on the current contents of the
 * component tree.
 */
export default function createStudioStylingPlugin(): PluginOption {
  return {
    name: "css-inline",
    enforce: "pre",
    resolveId(id, importer) {
      if (!importer) {
        return;
      }
      const extName = upath.extname(id);
      if (!extName) {
        return;
      }

      const parentComponentName = getUUIDNameQueryParam(importer);
      let filepath;

      if (parentComponentName) {
        filepath = addQueryParam(
          id,
          "studioComponentUUID",
          parentComponentName
        );
      }
      // const isStyle = extName === ".css" || extName === ".scss"
      // if (isStyle && !parentComponentName) {
      //   filepath = addQueryParam(id, "studioPageName", upath.basename(id, upath.extname(id)))
      //   console.log(filepath)
      // }
      if (filepath) {
        return this.resolve(filepath, importer);
      }
    },
  };
}

export function getUUIDNameQueryParam(filepath: string) {
  const getComponentNameRE = /(?<=\?.*studioComponentUUID=)[a-zA-Z0-9-]*/;
  const componentNameResult = filepath.match(getComponentNameRE);
  return componentNameResult ? String(componentNameResult) : undefined;
}

function addQueryParam(filepath: string, query: string, value?: string) {
  if (filepath.includes(query)) {
    return undefined;
  }
  const hasQuery = !!filepath.match(/\?/);
  let newFilepath = filepath;
  if (hasQuery) {
    newFilepath = newFilepath.concat("&&");
  } else {
    newFilepath = newFilepath.concat("?");
  }
  newFilepath = newFilepath.concat(query);
  if (value) {
    newFilepath = newFilepath.concat(`=${value}`);
  }
  return newFilepath;
}
