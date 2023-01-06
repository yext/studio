import { Project } from "ts-morph";
import FileSystemManager from "../src/FileSystemManager";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths";
import path from "path";
import fs from "fs";
import { FileSystemWriter } from "../src/writers/FileSystemWriter";
import { ComponentStateKind, FileMetadataKind, PageState } from "../src";

const pageState: PageState = {
  componentTree: [
    {
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      props: {},
      uuid: "mock-uuid-0",
      metadataUUID: "mock-metadata-uuid",
    },
  ],
  cssImports: [],
  filepath: "some/file/path",
};

const projectRoot = path.resolve(__dirname, "./__fixtures__/FileSystemManager");
const tsMorphProject: Project = createTsMorphProject();
const paths = getUserPaths(projectRoot);
paths.pages = projectRoot;

const orchestrator = new ParsingOrchestrator(tsMorphProject, paths, false);
const fileManager = new FileSystemManager(
  tsMorphProject,
  paths,
  new FileSystemWriter(orchestrator, false)
);

it("throw errors if the filepath to update is not a valid user path", async () => {
  await expect(
    fileManager.updateFile("/invalid/pages/NewPage.tsx", pageState)
  ).rejects.toThrow(
    `Cannot update file: filepath "/invalid/pages/NewPage.tsx" is not within the paths recognized by Studio.`
  );
});

it("updates user page file based on new state", async () => {
  jest.spyOn(fs, "existsSync").mockImplementation(() => true);
  const fsWriteFileSyncSpy = jest
    .spyOn(fs, "writeFileSync")
    .mockImplementation();

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

  await fileManager.updateFile(
    path.join(paths.pages, "NewPage.tsx"),
    pageState
  );

  expect(fsWriteFileSyncSpy).toHaveBeenCalledWith(
    expect.stringContaining("NewPage.tsx"),
    fs.readFileSync(path.join(paths.pages, "UpdatedPage.tsx"), "utf-8")
  );
});
