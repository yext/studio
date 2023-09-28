import { PluginOption } from "vite";

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
    async resolveId(id, importer) {
      if (!importer) {
        return;
      }

      // this breaks it for some reason.
      if (id.includes("react/jsx-dev-runtime")) {
        return;
      }

      const parentComponentName = getUUIDQueryParam(importer);
      if (parentComponentName) {
        const filepath = addQueryParam(
          id,
          "studioComponentUUID",
          parentComponentName
        );
        if (filepath) {
          return this.resolve(filepath, importer);
        }
      }
    },
  };
}

export function getUUIDQueryParam(filepath: string) {
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
