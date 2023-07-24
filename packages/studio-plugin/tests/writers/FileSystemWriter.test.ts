import { Project } from "ts-morph";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "../../src/ParsingOrchestrator";
import getUserPaths from "../../src/parsers/getUserPaths";
import upath from "upath";
import fs from "fs";
import { FileSystemWriter } from "../../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
} from "../../src/types";

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
paths.modules = upath.join(projectRoot, "modules");

const bannerComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "mock-uuid-0",
  metadataUUID: "mock-metadata-uuid",
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
  filepath: upath.join(paths.modules, "UpdatedModule.tsx"),
};

describe("syncFileMetadata", () => {
  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, {
    paths,
    openBrowser: true,
    isPagesJSRepo: false,
    port: 8080,
  });
  const fileWriter = new FileSystemWriter(orchestrator, tsMorphProject);

  it("updates user module file based on new state", () => {
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    fileWriter.writeToModuleFile(moduleMetadata);

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("UpdatedModule.tsx"),
      fs.readFileSync(upath.join(paths.modules, "UpdatedModule.tsx"), "utf-8")
    );
  });

  it("creates a new module file and adds a component based on new state", () => {
    const moduleFilepath = upath.join(paths.modules, "UpdatedModule.tsx");

    jest.spyOn(fs, "existsSync").mockImplementation(() => false);
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();
    const fsMkdirSyncSpy = jest
      .spyOn(fs, "mkdirSync")
      .mockImplementationOnce(jest.fn());
    const fsOpenSyncSpy = jest
      .spyOn(fs, "openSync")
      .mockImplementationOnce(jest.fn());

    fileWriter.writeToModuleFile(moduleMetadata);

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("UpdatedModule.tsx"),
      fs.readFileSync(moduleFilepath, "utf-8")
    );
    expect(fsMkdirSyncSpy).toHaveBeenCalledWith(paths.modules, {
      recursive: true,
    });
    expect(fsOpenSyncSpy).toHaveBeenCalledWith(moduleFilepath, "w");
  });
});
