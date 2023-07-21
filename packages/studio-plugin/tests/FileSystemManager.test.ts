import { Project } from "ts-morph";
import FileSystemManager from "../src/FileSystemManager";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths";
import upath from "upath";
import fs from "fs";
import { FileSystemWriter } from "../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  PageState,
} from "../src/types";

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
  filepath: "some/file/path",
};

const projectRoot = upath.resolve(
  __dirname,
  "./__fixtures__/FileSystemManager"
);
const tsMorphProject: Project = createTsMorphProject();
const paths = getUserPaths(projectRoot);
paths.pages = upath.join(projectRoot, "pages");
paths.modules = upath.join(projectRoot, "modules");

const orchestrator = new ParsingOrchestrator(tsMorphProject, {
  paths,
  openBrowser: true,
  isPagesJSRepo: false,
  port: 8080,
});
const fileManager = new FileSystemManager(
  paths,
  new FileSystemWriter(orchestrator, tsMorphProject)
);

const bannerFilepath = upath.join(paths.components, "Banner.tsx");
jest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .spyOn(ParsingOrchestrator.prototype as any, "initFilepathToFileMetadata")
  .mockImplementation(() => ({
    [bannerFilepath]: {
      kind: FileMetadataKind.Component,
      metadataUUID: "mock-metadata-uuid",
      filepath: bannerFilepath,
    },
  }));

describe("updatePageFile", () => {
  it("throw errors if the filepath to update is not a valid page path", () => {
    expect(() =>
      fileManager.updatePageFile("/invalid/pages/NewPage.tsx", pageState)
    ).toThrow(
      'Cannot update page file: filepath "/invalid/pages/NewPage.tsx"' +
        ` is not within the expected path for pages "${paths.pages}".`
    );
  });

  it("updates user page file based on new state", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    fileManager.updatePageFile(
      upath.join(paths.pages, "NewPage.tsx"),
      pageState
    );

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewPage.tsx"),
      fs.readFileSync(upath.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });

  it("creates a new page file and add a page component based on new state", () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);
    const fsMkdirSyncSpy = jest.spyOn(fs, "mkdirSync").mockImplementation();
    const fsOpenSyncSpy = jest
      .spyOn(fs, "openSync")
      .mockImplementationOnce(jest.fn());
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    const pageFilepath = upath.join(paths.pages, "NewPage.tsx");
    fileManager.updatePageFile(pageFilepath, pageState);

    expect(fsMkdirSyncSpy).toHaveBeenCalledWith(paths.pages, {
      recursive: true,
    });
    expect(fsOpenSyncSpy).toHaveBeenCalledWith(pageFilepath, "w");
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewPage.tsx"),
      fs.readFileSync(upath.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });
});
