import { IOErrorKind } from "../../src/errors/FileIOError";
import { ParsingErrorKind } from "../../src/errors/ParsingError";
import getStudioConfig from "../../src/parsers/getStudioConfig";
import path from "path";

it("returns default config when studio config file is not found", async () => {
  const studioConfig = await getStudioConfig("test-site");
  expect(studioConfig).toEqual({
    isPagesJSRepo: false,
    paths: {
      components: path.normalize("test-site/src/components"),
      localData: path.normalize("test-site/localData"),
      modules: path.normalize("test-site/src/modules"),
      pages: path.normalize("test-site/src/pages"),
      siteSettings: path.normalize("test-site/src/siteSettings.ts"),
    },
    port: 8080,
  });
});

it("merges the user's studio config with the default config for unspecified fields", async () => {
  const projectRoot = path.resolve(__dirname, "../__fixtures__/StudioConfigs");
  const studioConfig = await getStudioConfig(projectRoot);
  expect(studioConfig).toEqual({
    isPagesJSRepo: false,
    paths: {
      components: "custom/components/folder/path",
      localData: path.join(projectRoot, "localData"),
      modules: path.join(projectRoot, "src", "modules"),
      pages: "custom/pages/folder/path",
      siteSettings: path.join(projectRoot, "src", "siteSettings.ts"),
    },
    port: 8080,
  });
});

it("throws FileIOError when user's studio config fails to import", async () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/StudioConfigs/malformed"
  );

  await expect(getStudioConfig(projectRoot)).rejects.toEqual({
    kind: IOErrorKind.FailedToImportFile,
    message: `Failed to import module at ${path.join(projectRoot, 'studio.config.js')}`,
  });
});

it("throws ParsingError when user's studio config is not a default export", async () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/StudioConfigs/malformed/missing-default"
  );

  await expect(getStudioConfig(projectRoot)).rejects.toEqual({
    kind: ParsingErrorKind.InvalidStudioConfig,
    message: "Studio Config must be a default export",
  });
});
