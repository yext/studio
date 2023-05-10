import { IOErrorKind } from "../../src/errors/FileIOError";
import { ParsingErrorKind } from "../../src/errors/ParsingError";
import getStudioConfig from "../../src/parsers/getStudioConfig";
import path from "path";

it("returns default config when studio config file is not found", async () => {
  const studioConfig = await getStudioConfig("test-site");
  expect(studioConfig).toEqual({
    isPagesJSRepo: false,
    paths: {
      components: "test-site/src/components",
      localData: "test-site/localData",
      modules: "test-site/src/modules",
      pages: "test-site/src/pages",
      siteSettings: "test-site/src/siteSettings.ts",
    },
    plugins: [],
  });
});

it("returns user studio config merge with default config for unspecified fields", async () => {
  const projectRoot = path.resolve(__dirname, "../__fixtures__/StudioConfigs");
  const studioConfig = await getStudioConfig(projectRoot);
  expect(studioConfig).toEqual({
    isPagesJSRepo: false,
    paths: {
      components: "custom/components/folder/path",
      localData: projectRoot + "/localData",
      modules: projectRoot + "/src/modules",
      pages: "custom/pages/folder/path",
      siteSettings: projectRoot + "/src/siteSettings.ts",
    },
    plugins: [],
  });
});

it("returns user studio config merge with multiple plugin import methods", async () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/StudioConfigs/plugins"
  );
  const studioConfig = await getStudioConfig(projectRoot);
  expect(studioConfig).toEqual({
    isPagesJSRepo: false,
    paths: {
      components: "custom/components/folder/path",
      localData: projectRoot + "/localData",
      modules: projectRoot + "/src/modules",
      pages: "custom/pages/folder/path",
      siteSettings: projectRoot + "/src/siteSettings.ts",
    },
    plugins: [
      {
        name: "@yext/sample-component",
        components: ["src/components/AceComponent.tsx"],
      },
      {
        name: "@yext/sample-component-2",
        components: ["src/components/BevComponent.tsx"],
      },
    ],
  });
});

it("throws FileIOErorr when user's studio config fails to import", async () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/StudioConfigs/malformed"
  );

  let thrownError;
  try {
    await getStudioConfig(projectRoot);
  } catch (err) {
    thrownError = err;
  }

  expect(thrownError).toEqual({
    kind: IOErrorKind.FailedToImportFile,
    message: `Failed to import module at ${projectRoot}/studio.config.js`,
  });
});

it("throws ParsingError when user's studio config is not a default export", async () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/StudioConfigs/malformed/missing-default"
  );

  let thrownError;
  try {
    await getStudioConfig(projectRoot);
  } catch (err) {
    thrownError = err;
  }

  expect(thrownError).toEqual({
    kind: ParsingErrorKind.InvalidStudioConfig,
    message: "Studio Config must be a default export",
  });
});
