import { ModuleGraph, ModuleNode, PluginOption } from "vite";
import upath from "upath"

export default function createStudioStylingPlugin(): PluginOption {
  let moduleGraph: ModuleGraph;
  const importerToCssMap: Record<string, Set<string>> = {}

  return {
    name: "StudioStyling",
    enforce: "pre",
    configureServer(server) {
      moduleGraph = server.moduleGraph;
    },
    resolveId(id, importer) {
      if (!importer){
        return
      }
      const extName = upath.extname(id)
      if (extName === ".css") {
        const originalImporter = moduleGraph.getModuleById(importer)
        const studioStylingId = id.replace(".css", ".studiostyling").replace(/^[./]*/, "")
        const importers: ModuleNode[] = []; // TODO currently don't use absolute paths. must do.
        if (originalImporter) {
          importers.push(originalImporter)
        }
        importers.push(...Array.from(moduleGraph.getModuleById(importer)?.importers ?? []))
        while (importers.length) {  // TODO circular dependences?
          const importer = importers.shift();
          if (!importer?.file){
            continue
          }
          if (!importerToCssMap.hasOwnProperty(importer.file)){
            importerToCssMap[importer.file] = new Set;
          }
          importerToCssMap[importer.file].add(studioStylingId)
          importers.concat(Array.from(importer.importers ?? []))
        }
        return studioStylingId
      }
    }, 
    load(id) {
      if (id.includes(".studiostyling")) {
        const arrVersion: Record<string, string[]> = {};
        Object.entries(importerToCssMap).forEach(([importer, cssSet]) => {
          arrVersion[importer] = Array.from(cssSet)
        })
        return `
        import { setCssStyling } from '@yext/studio-ui'
        setCssStyling(${JSON.stringify(arrVersion)})
        `
      }
    }
  };
}