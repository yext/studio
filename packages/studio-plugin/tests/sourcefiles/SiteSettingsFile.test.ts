import { PropValueKind, PropValueType, SiteSettings } from "../../src/types";
import SiteSettingsFile from "../../src/sourcefiles/SiteSettingsFile";
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
        mySetting: { type: PropValueType.string, required: true },
        isDev: { type: PropValueType.boolean, required: true },
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
          required: true,
          shape: {
            "Primary Theme": {
              type: PropValueType.HexColor,
              required: true,
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
              valueType: PropValueType.HexColor,
              kind: PropValueKind.Literal,
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

  it("can update site settings with nested objects", () => {
    const siteSettingsFile = new SiteSettingsFile(
      getSiteSettingsPath("nestedSiteSettings.ts"),
      tsMorphProject
    );
    siteSettingsFile.updateSiteSettingValues({
      "Global Color Style": {
        valueType: PropValueType.Object,
        kind: PropValueKind.Literal,
        value: {
          "Primary Theme": {
            valueType: PropValueType.HexColor,
            kind: PropValueKind.Literal,
            value: "#AABBCC",
          },
        },
      },
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining("nestedSiteSettings.ts"),
      fs.readFileSync(
        getSiteSettingsPath("updatedNestedSiteSettings.ts"),
        "utf-8"
      )
    );
  });
});
