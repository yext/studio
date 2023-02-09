import { Project } from "ts-morph";
import FileSystemManager from "../src/FileSystemManager";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths";
import path from "path";
import fs from "fs";
import { FileSystemWriter } from "../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
  PageState,
} from "../src";

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

const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  componentTree: [
    {
      kind: ComponentStateKind.Fragment,
      uuid: "mock-uuid-parent",
    },
    {
      ...bannerComponentState,
      parentUUID: "mock-uuid-parent",
    },
  ],
  metadataUUID: "metadata-uuid",
  filepath: "mock-filepath",
};

const projectRoot = path.resolve(__dirname, "./__fixtures__/FileSystemManager");
const tsMorphProject: Project = createTsMorphProject();
const paths = getUserPaths(projectRoot);
paths.pages = path.join(projectRoot, "pages");
paths.modules = path.join(projectRoot, "modules");

const orchestrator = new ParsingOrchestrator(
  tsMorphProject,
  paths,
  [],
  (filename) => import(filename),
  false
);
const fileManager = new FileSystemManager(
  paths,
  new FileSystemWriter(orchestrator, false, tsMorphProject)
);

const bannerFilepath = path.join(paths.components, "Banner.tsx");
jest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .spyOn(ParsingOrchestrator.prototype as any, "setFilepathToFileMetadata")
  .mockImplementation(() => ({
    [bannerFilepath]: {
      kind: FileMetadataKind.Component,
      metadataUUID: "mock-metadata-uuid",
      filepath: bannerFilepath,
    },
  }));

describe("updatePageFile", () => {
  it("throw errors if the filepath to update is not a valid page path", async () => {
    await expect(
      fileManager.updatePageFile("/invalid/pages/NewPage.tsx", pageState)
    ).rejects.toThrow(
      'Cannot update page file: filepath "/invalid/pages/NewPage.tsx"' +
        ` is not within the expected path for pages "${paths.pages}".`
    );
  });

  it("updates user page file based on new state", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    await fileManager.updatePageFile(
      path.join(paths.pages, "NewPage.tsx"),
      pageState
    );

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewPage.tsx"),
      fs.readFileSync(path.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });

  it("creates a new page file and add a page component based on new state", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);
    const fsMkdirSyncSpy = jest.spyOn(fs, "mkdirSync").mockImplementation();
    const fsOpenSyncSpy = jest
      .spyOn(fs, "openSync")
      .mockImplementationOnce(jest.fn());
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    const pageFilepath = path.join(paths.pages, "NewPage.tsx");
    await fileManager.updatePageFile(pageFilepath, pageState);

    expect(fsMkdirSyncSpy).toHaveBeenCalledWith(paths.pages, {
      recursive: true,
    });
    expect(fsOpenSyncSpy).toHaveBeenCalledWith(pageFilepath, "w");
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewPage.tsx"),
      fs.readFileSync(path.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
    );
  });
});

describe("updateModuleFile", () => {
  it("throw errors if the filepath to update is not a valid module path", async () => {
    expect(() =>
      fileManager.updateModuleFile(
        "/invalid/modules/NewModule.tsx",
        moduleMetadata
      )
    ).toThrowError(
      'Cannot update module file: filepath "/invalid/modules/NewModule.tsx"' +
        ` is not within the expected path for modules "${paths.modules}".`
    );
  });

  it("updates user module file based on new state", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => true);
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    fileManager.updateModuleFile(
      path.join(paths.modules, "NewModule.tsx"),
      moduleMetadata
    );

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewModule.tsx"),
      fs.readFileSync(path.join(paths.modules, "UpdatedModule.tsx"), "utf-8")
    );
  });

  it("creates a new module file and adds a component based on new state", async () => {
    jest.spyOn(fs, "existsSync").mockImplementation(() => false);
    const fsMkdirSyncSpy = jest.spyOn(fs, "mkdirSync").mockImplementation();
    const fsOpenSyncSpy = jest
      .spyOn(fs, "openSync")
      .mockImplementationOnce(jest.fn());
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    const moduleFilepath = path.join(paths.modules, "NewModule.tsx");
    fileManager.updateModuleFile(moduleFilepath, moduleMetadata);

    expect(fsMkdirSyncSpy).toHaveBeenCalledWith(paths.modules, {
      recursive: true,
    });
    expect(fsOpenSyncSpy).toHaveBeenCalledWith(moduleFilepath, "w");
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewModule.tsx"),
      fs.readFileSync(path.join(paths.modules, "UpdatedModule.tsx"), "utf-8")
    );
  });
});
