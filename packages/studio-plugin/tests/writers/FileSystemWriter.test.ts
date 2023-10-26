import { Project } from "ts-morph";
import ParsingOrchestrator from "../../src/orchestrators/ParsingOrchestrator";
import getUserPaths from "../../src/parsers/getUserPaths";
import upath from "upath";
import fs from "fs";
import { FileSystemWriter } from "../../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  PageState,
  PropValueKind,
  PropValueType,
  SiteSettingsValues,
} from "../../src/types";
import { createTestProject } from "../__utils__/createTestSourceFile";
import * as uuidUtils from "uuid";

jest.mock("uuid");
jest.spyOn(uuidUtils, "v4").mockReturnValue("mock-metadata-uuid");

jest.mock("fs", () => {
  const actualFs = jest.requireActual("fs");
  return {
    ...actualFs,
  };
});

const projectRoot = upath.resolve(
  __dirname,
  "../__fixtures__/FileSystemManager"
);
const paths = getUserPaths(projectRoot);
paths.pages = upath.join(projectRoot, "pages");
paths.components = upath.join(projectRoot, "components");
paths.siteSettings = upath.join(projectRoot, "siteSettings.ts");

const bannerComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "mock-uuid-0",
  metadataUUID: "mock-metadata-uuid",
};

const pageState: PageState = {
  componentTree: [bannerComponentState],
  styleImports: [],
  filepath: upath.join(paths.pages, "UpdatedPage.tsx"),
};

const siteSettingsValues: SiteSettingsValues = {
  experienceKey: {
    kind: PropValueKind.Literal,
    valueType: PropValueType.string,
    value: "slanswers",
  },
};

describe("writes to source files on new state", () => {
  const tsMorphProject: Project = createTestProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, {
    paths,
    openBrowser: true,
    isPagesJSRepo: false,
    port: 8080,
  });
  const fileWriter = new FileSystemWriter(orchestrator, tsMorphProject);

  it("updates user page based on new state", () => {
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();
    fileWriter.writeToPageFile("UpdatedPage", pageState);
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("UpdatedPage.tsx"),
      fs.readFileSync(upath.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });

  it("updates site settings based on new state", () => {
    orchestrator.getStudioData(); // initializes this.siteSettingsFile
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();
    fileWriter.writeToSiteSettings(siteSettingsValues);
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("siteSettings.ts"),
      fs.readFileSync(paths.siteSettings, "utf-8")
    );
  });
});
