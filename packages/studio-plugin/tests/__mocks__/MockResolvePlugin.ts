import typescript, { Extension } from "typescript";
import { ResolvePlugin } from "../../src";

export default class MockResolvePlugin extends ResolvePlugin {
  constructor(moduleName: string) {
    super(moduleName);
  }

  resolveModuleName(
    moduleName: string,
    root = process.cwd()
  ): {
    resolvedModule: typescript.ResolvedModuleFull;
    root: string;
  } {
    return {
      resolvedModule: {
        resolvedFileName: "tests/__fixtures__/PluginConfig/SampleComponent.tsx",
        extension: Extension.Jsx,
        isExternalLibraryImport: true,
        packageId: {
          name: moduleName,
          subModuleName: "SampleComponent.tsx",
          version: "0.0.0",
        },
      },
      root,
    };
  }
}
