import { ModuleGraph, PluginOption } from "vite";
import upath from "upath";

export default function createStudioStylingPlugin(): PluginOption {
  let moduleGraph: ModuleGraph;
  const importerToCssMap: Record<string, Set<string>> = {};

  function updateImporterToCssMap(id: string, importer: string) {
    const cssFilepath = getFormattedFilepath(id, upath.dirname(importer));
    const importerNode = moduleGraph.getModuleById(importer);
    if (!importerNode) {
      throw Error("CSS/SCSS file importer not found.");
    }
    const importers = new Set([importerNode]);
    importers.forEach((importer) => {
      if (!importer?.file) {
        return;
      }
      if (!importerToCssMap.hasOwnProperty(importer.file)) {
        importerToCssMap[importer.file] = new Set();
      }
      importerToCssMap[importer.file].add(cssFilepath);
      importer.importers.forEach((importer) => {
        importers.add(importer);
      });
    });
  }

  return {
    name: "StudioStyling",
    enforce: "pre",
    configureServer(server) {
      moduleGraph = server.moduleGraph;
    },
    resolveId(id, importer) {
      if (!importer) {
        return;
      }
      if (!isStylingFile(id) || getQueryParameterExists(id, "studioStyling")) {
        return;
      }
      updateImporterToCssMap(id, importer);
      return id.replace(".css", ".studiostyling.js");
    },
    load(id) {
      if (id.includes(".studiostyling.js")) {
        const importerToCssArrayMap = convertSetMapToArrayMap(importerToCssMap);
        return `
        import { updateFilepathToCssClasses } from '@yext/studio-ui';
        updateFilepathToCssClasses(${JSON.stringify(importerToCssArrayMap)});
        `;
      }
    },
  };
}

function getFormattedFilepath(id: string, importer: string) {
  if (id.startsWith(".")) {
    return upath.join(importer, id);
  }
  return id;
}

function getQueryParameterExists(
  filepath: string,
  queryParameter: string
): boolean {
  const queryParameterRE = new RegExp(`^.*?.*${queryParameter}`);
  const queryParameterResult = filepath.match(queryParameterRE);
  return !!queryParameterResult;
}

function isStylingFile(id: string): boolean {
  const extName = upath.extname(id);
  return !!extName.match(/.[s]?css/);
}

function convertSetMapToArrayMap(
  setMap: Record<string, Set<string>>
): Record<string, string[]> {
  const importerToCssArrayMap: Record<string, string[]> = {};
  Object.entries(setMap).forEach(([importer, cssSet]) => {
    importerToCssArrayMap[importer] = Array.from(cssSet);
  });
  return importerToCssArrayMap;
}
