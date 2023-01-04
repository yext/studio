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
  });
});

it("returns user studio config merge with default config for unspecified fields", async () => {
  const projectRoot = path.resolve(__dirname, "../__fixtures__");
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
  });
});
