import { PropValueKind, PropValueType } from "../../src";
import SiteSettingsFile, {
  SiteSettings,
} from "../../src/sourcefiles/SiteSettingsFile";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { getSiteSettingsPath } from "../__utils__/getFixturePath";
import fs from "fs";
import { Project } from "ts-morph";

let tsMorphProject: Project;
beforeEach(() => {
  jest.spyOn(fs, "writeFileSync").mockImplementation();
  tsMorphProject = createTsMorphProject();
});

describe("getSiteSettings", () => {
  it("can parse SiteSettings", () => {
    const siteSettingsFile = new SiteSettingsFile(
      getSiteSettingsPath(),
      tsMorphProject
    );
    const expectedSiteSettings: SiteSettings = {
      shape: {
        mySetting: { type: PropValueType.string },
        isDev: { type: PropValueType.boolean },
      },
      values: {
        mySetting: {
          valueType: PropValueType.string,
          kind: PropValueKind.Literal,
          value: "just the two of us",
        },
        isDev: {
          valueType: PropValueType.boolean,
          kind: PropValueKind.Literal,
          value: true,
        },
      },
    };
    expect(siteSettingsFile.getSiteSettings()).toEqual(expectedSiteSettings);
  });

  it("errors out if the default export is missing", () => {
    const siteSettingsFile = new SiteSettingsFile(
      getSiteSettingsPath("blankFile.ts"),
      tsMorphProject
    );
    expect(() => siteSettingsFile.getSiteSettings()).toThrow(
      "No default export found for site settings"
    );
  });

  it("can parse nested SiteSettings", () => {
    const siteSettingsFile = new SiteSettingsFile(
      getSiteSettingsPath("nestedSiteSettings.ts"),
      tsMorphProject
    );

    expect(siteSettingsFile.getSiteSettings()).toEqual({
      shape: {
        "Global Color Style": {
          type: PropValueType.Object,
          shape: {
            "Primary Theme": {
              type: PropValueType.HexColor,
            },
          },
        },
      },
      values: {
        "Global Color Style": {
          valueType: PropValueType.Object,
          kind: PropValueKind.Literal,
          value: {
            "Primary Theme": {
              value: "#CBAEAE",
            },
          },
        },
      },
    });
  });
});

describe("updateSiteSettingValues", () => {
  it("updates site settings with new value", () => {
    const siteSettingsFile = new SiteSettingsFile(
      getSiteSettingsPath(),
      tsMorphProject
    );
    siteSettingsFile.updateSiteSettingValues({
      mySetting: {
        valueType: PropValueType.string,
        kind: PropValueKind.Literal,
        value: "the last of us",
      },
      isDev: {
        valueType: PropValueType.boolean,
        kind: PropValueKind.Literal,
        value: false,
      },
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("siteSettings.ts"),
      fs.readFileSync(
        getSiteSettingsPath("siteSettingsWithNewPropValues.ts"),
        "utf-8"
      )
    );
  });

  it("errors out if site settings new value contains expression type", () => {
    const filepath = getSiteSettingsPath();
    const siteSettingsFile = new SiteSettingsFile(filepath, tsMorphProject);
    expect(() =>
      siteSettingsFile.updateSiteSettingValues({
        mySetting: {
          valueType: PropValueType.string,
          kind: PropValueKind.Expression,
          value: "someExpression.field",
        },
      })
    ).toThrow(
      `PropVal mySetting in ${filepath} is of kind PropValueKind.Expression.` +
        " PropValueKind.Expression in ObjectLiteralExpression is currently not supported."
    );
  });
});
