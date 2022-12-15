import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import SiteSettingsFile from "../../src/sourcefiles/SiteSettingsFile";
import { getSiteSettingsPath } from "../__utils__/getFixturePath";

const project = createTsMorphProject();

it("can parse SiteSettings", () => {
  const siteSettingsFile = new SiteSettingsFile(getSiteSettingsPath(), project);
  expect(siteSettingsFile.getSiteSettings()).toEqual({
    shape: { mySetting: { type: "string" } },
    values: {
      mySetting: {
        valueType: "string",
        kind: "literal",
        value: "just the two of us",
      },
    },
  });
});

it("errors out if the default export is missing", () => {
  const siteSettingsFile = new SiteSettingsFile(
    getSiteSettingsPath("blankFile.ts"),
    project
  );
  expect(() => siteSettingsFile.getSiteSettings()).toThrow(
    "No default export found for site settings"
  );
});
