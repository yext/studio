/* eslint-disable @typescript-eslint/no-useless-constructor */
import typescript, { Extension } from "typescript";
import NpmLookup from "../../src/parsers/helpers/NpmLookup";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export default class MockNpmLookup extends NpmLookup {
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
