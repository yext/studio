import { Project } from "ts-morph";
import ParsingOrchestrator from "../../src/ParsingOrchestrator";
import getUserPaths from "../../src/parsers/getUserPaths";
import upath from "upath";
import fs from "fs";
import { FileSystemWriter } from "../../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  PageState,
} from "../../src/types";
import { createTestProject } from "../__utils__/createTestSourceFile";

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

const bannerComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "mock-uuid-0",
  metadataUUID: "mock-metadata-uuid",
};

const pageState: PageState = {
  componentTree: [bannerComponentState],
  cssImports: [],
  filepath: upath.join(paths.pages, "UpdatedPage.tsx"),
};

describe("syncFileMetadata", () => {
  const tsMorphProject: Project = createTestProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, {
    paths,
    openBrowser: true,
    isPagesJSRepo: false,
    port: 8080,
  });
  const fileWriter = new FileSystemWriter(orchestrator, tsMorphProject);

  it("updates user file based on new state", () => {
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    fileWriter.writeToPageFile("UpdatedPage", pageState);

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("UpdatedPage.tsx"),
      fs.readFileSync(upath.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });
});
