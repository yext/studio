import { Project } from "ts-morph";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "../../src/ParsingOrchestrator";
import getUserPaths from "../../src/parsers/getUserPaths";
import path from "path";
import fs from "fs";
import { FileSystemWriter } from "../../src/writers/FileSystemWriter";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  ModuleMetadata,
} from "../../src/types";

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
  filepath: "mock-filepath",
};

describe("syncFileMetadata", () => {
  const projectRoot = path.resolve(
    __dirname,
    "../__fixtures__/FileSystemManager"
  );
  const tsMorphProject: Project = createTsMorphProject();
  const paths = getUserPaths(projectRoot);
  paths.pages = path.join(projectRoot, "pages");
  paths.modules = path.join(projectRoot, "modules");
  const orchestrator = new ParsingOrchestrator(tsMorphProject, paths, []);
  const fileWriter = new FileSystemWriter(orchestrator, tsMorphProject);

  it("updates user module file based on new state", async () => {
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    fileWriter.writeToModuleFile(
      path.join(paths.modules, "NewModule.tsx"),
      moduleMetadata
    );

    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewModule.tsx"),
      fs.readFileSync(path.join(paths.modules, "UpdatedModule.tsx"), "utf-8")
    );
  });

  it("creates a new module file and adds a component based on new state", async () => {
    const fsWriteFileSyncSpy = jest
      .spyOn(fs, "writeFileSync")
      .mockImplementation();

    const moduleFilepath = path.join(paths.modules, "NewModule.tsx");
    fileWriter.writeToModuleFile(moduleFilepath, moduleMetadata);
    expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
      expect.stringContaining("NewModule.tsx"),
      fs.readFileSync(path.join(paths.modules, "UpdatedModule.tsx"), "utf-8")
    );
  });
});
