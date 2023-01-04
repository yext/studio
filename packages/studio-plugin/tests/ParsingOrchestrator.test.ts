import ParsingOrchestrator, { createTsMorphProject } from "../src/ParsingOrchestrator";
import path from "path";
import getUserPaths from "../src/parsers/getUserPaths";
import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
  StudioData,
} from "../src";
import { Project } from "ts-morph";

const projectRoot = path.resolve(
  __dirname,
  "./__fixtures__/ParsingOrchestrator"
);
const userPaths = getUserPaths(projectRoot);

const basicPageState: PageState = {
  componentTree: [
    expect.objectContaining({
      componentName: "div",
      kind: ComponentStateKind.BuiltIn,
    }),
    expect.objectContaining({
      componentName: "Card",
      kind: ComponentStateKind.Standard,
    }),
    expect.objectContaining({
      componentName: "Card",
      kind: ComponentStateKind.Standard,
    }),
  ],
  filepath: expect.anything(),
  cssImports: [],
};

const pageWithModulesState: PageState = {
  componentTree: [
    expect.objectContaining({
      componentName: "NestedBanner",
      kind: ComponentStateKind.Standard,
    }),
    expect.objectContaining({
      componentName: "NestedModule",
      kind: ComponentStateKind.Module,
    }),
  ],
  filepath: expect.anything(),
  cssImports: [],
};

describe("aggregates data as expected", () => {
  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, userPaths, false);
  let studioData: StudioData;

  beforeAll(async () => {
    studioData = await orchestrator.getStudioData();
  });

  it("UUIDToFileMetadata", () => {
    const fileMetadataArray = Object.values(studioData.UUIDToFileMetadata);
    expect(fileMetadataArray).toHaveLength(4);
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/Card.tsx"),
        kind: FileMetadataKind.Component,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/NestedBanner.tsx"),
        kind: FileMetadataKind.Component,
        acceptsChildren: true,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("modules/BannerWithCard.tsx"),
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ componentName: "NestedBanner" }),
          expect.objectContaining({ componentName: "Card" }),
        ],
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("modules/NestedModule.tsx"),
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ kind: ComponentStateKind.Fragment }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
        ],
      })
    );
  });

  it("pageNameToPageState", () => {
    expect(studioData.pageNameToPageState).toEqual({
      basicPage: basicPageState,
      pageWithModules: pageWithModulesState,
    });
  });

  it("siteSettings", () => {
    expect(studioData.siteSettings).toEqual({
      shape: expect.anything(),
      values: expect.anything(),
    });
  });

  describe("isPagesJSRepo", () => {
    it("aggregates pageNameToPageState as expected when isPagesJSRepo is true", async () => {
      const orchestrator = new ParsingOrchestrator(tsMorphProject, userPaths, true);
      const studioData = await orchestrator.getStudioData();
      expect(studioData.pageNameToPageState).toEqual({
        basicPage: {
          ...basicPageState,
          entityFiles: ["basicpage-stream.json"],
        },
        pageWithModules: pageWithModulesState,
      });
    });

    it("throws an error when isPagesJSRepo is true and localData's mapping.json file doesn't exist", async () => {
      userPaths.localData = "thisFolderDoesNotExist";
      const orchestrator = new ParsingOrchestrator(tsMorphProject, userPaths, true);
      await expect(orchestrator.getStudioData()).rejects.toThrow(
        /^The localData's mapping.json does not exist/
      );
    });
  });
});

it("throws an error when the page imports components from unexpected folders", async () => {
  const userPaths = getUserPaths("thisFolderDoesNotExist");
  userPaths.pages = path.resolve(
    __dirname,
    "./__fixtures__/ParsingOrchestrator/src/pages"
  );
  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, userPaths, false);
  await expect(orchestrator.getStudioData()).rejects.toThrow(
    /^Could not get FileMetadata for/
  );
});

it("throws when the pages folder does not exist", async () => {
  const userPaths = getUserPaths(
    path.resolve(__dirname, "./__fixtures__/ParsingOrchestrator")
  );
  userPaths.pages = "thisFolderDoesNotExist";

  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(tsMorphProject, userPaths, false);
  await expect(orchestrator.getStudioData()).rejects.toThrow(
    /^The pages directory does not exist/
  );
});
