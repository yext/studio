import { Project } from "ts-morph";
import FileSystemManager from "../src/FileSystemManager"
import ParsingOrchestrator, { createTsMorphProject } from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths"
import path from "path"
import fs from "fs";
import { FileSystemWriter } from "../src/writers/FileSystemWriter";
import { ComponentStateKind, FileMetadataKind } from "../src";

const projectRoot = path.resolve(
  __dirname,
  "./__fixtures__/FileSystemManager"
);
const tsMorphProject: Project = createTsMorphProject();
const paths = getUserPaths(projectRoot)
paths.pages = projectRoot

it('modify user files based on pending changes', async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const fsRmSyncSpy = jest.spyOn(fs, "rmSync").mockImplementation();
  const fsWriteFileSyncSpy = jest.spyOn(fs, "writeFileSync").mockImplementation();

  const bannerFilepath = path.join(paths.components, 'Banner.tsx')
  jest.spyOn(ParsingOrchestrator.prototype as any, 'setFilepathToFileMetadata')
    .mockImplementation(() => ({
      [bannerFilepath]: {
        kind: FileMetadataKind.Component,
        metadataUUID: 'mock-metadata-uuid',
        filepath: bannerFilepath,
      }
    }))
  const orchestrator = new ParsingOrchestrator(tsMorphProject, paths, false)
  const fileManager = new FileSystemManager(
    tsMorphProject, paths, new FileSystemWriter(orchestrator, false)
  )

  await fileManager.updateFileSystem({
    pageNameToPageState: {
      NewPage: {
        componentTree: [{
          kind: ComponentStateKind.Standard,
          componentName: "Banner",
          props: {},
          uuid: "mock-uuid-0",
          metadataUUID: "mock-metadata-uuid",
        }],
        cssImports: [],
        filepath: 'some/file/path'
      }
    },
    pendingChanges: {
      pagesToRemove: ['RemovePage'],
      pagesToUpdate: ['NewPage']
    }
  })
  expect(fsRmSyncSpy).toBeCalledTimes(1)
  expect(fsRmSyncSpy).toBeCalledWith(path.join(paths.pages, "RemovePage.tsx"))
  expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
    expect.stringContaining("NewPage.tsx"),
    fs.readFileSync(path.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
  );
})