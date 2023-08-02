import ParsingOrchestrator, {
  createTsMorphProject,
} from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths";
import upath from "upath";
import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
  PropValueKind,
  StudioData,
  UserPaths,
} from "../src/types";
import { Project } from "ts-morph";
import fs from "fs";
import prettyPrintError from "../src/errors/prettyPrintError";
import { assertIsOk } from "./__utils__/asserts";

jest.mock("../src/errors/prettyPrintError");

const projectRoot = upath.resolve(
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
  const orchestrator = createParsingOrchestrator();
  let studioData: StudioData;

  beforeAll(() => {
    studioData = orchestrator.getStudioData();
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
        filepath: expect.stringContaining("modules/a/b/NestedModule.tsx"),
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

  describe("PagesJS state", () => {
    it("aggregates pageNameToPageState as expected when receives a localDataMapping", () => {
      const getLocalDataMapping = () => ({
        basicPage: ["basicpage-stream.json"],
      });
      const orchestrator = createParsingOrchestrator({
        getLocalDataMapping,
        isPagesJS: true,
      });
      const studioData = orchestrator.getStudioData();
      expect(studioData.pageNameToPageState).toEqual({
        basicPage: {
          ...basicPageState,
          pagesJS: {
            entityFiles: ["basicpage-stream.json"],
            getPathValue: { kind: PropValueKind.Literal, value: "index.html" },
          },
        },
        pageWithModules: {
          ...pageWithModulesState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "document.slug",
            },
            streamScope: {},
          },
        },
      });
    });
  });
});

it("throws an error when the page imports components from unexpected folders", () => {
  const userPaths = getUserPaths("thisFolderDoesNotExist");
  userPaths.pages = upath.resolve(
    __dirname,
    "./__fixtures__/ParsingOrchestrator/src/pages"
  );
  createParsingOrchestrator({ paths: userPaths }).getStudioData();
  expect(prettyPrintError).toHaveBeenCalledTimes(2);
  expect(prettyPrintError).toHaveBeenCalledWith(
    expect.stringMatching(/^Failed to parse PageState/),
    expect.stringMatching(/^Error: Could not get FileMetadata for/)
  );
});

it("throws when the pages folder does not exist", () => {
  const userPaths = getUserPaths(
    upath.resolve(__dirname, "./__fixtures__/ParsingOrchestrator")
  );
  userPaths.pages = "thisFolderDoesNotExist";
  expect(() => createParsingOrchestrator({ paths: userPaths })).toThrow(
    /^The pages directory does not exist/
  );
});

describe("reloadFile", () => {
  const userPaths = getUserPaths(
    upath.resolve(__dirname, "./__fixtures__/ParsingOrchestrator.reloadFile")
  );
  const modulePath = upath.join(userPaths.modules, "BannerModule.tsx");
  const originalFile = fs.readFileSync(modulePath, "utf-8");
  const orchestrator = createParsingOrchestrator({ paths: userPaths });

  afterEach(() => {
    fs.writeFileSync(modulePath, originalFile);
  });

  it("reloadFile can reload a module file", () => {
    const updatedModuleFile = `
    import Banner from "../components/Banner";

    export default function NestedModule() {
      return (
        <Banner />
      );
    }
  `;
    const getComponentTree = () => {
      const result = orchestrator.getModuleFile(modulePath).getModuleMetadata();
      assertIsOk(result);
      return result.value.componentTree;
    };
    const originalTree = getComponentTree();
    expect(originalTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Fragment,
      }),
      expect.objectContaining({
        componentName: "Banner",
      }),
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);

    fs.writeFileSync(modulePath, updatedModuleFile);
    orchestrator.reloadFile(modulePath);
    const updatedTree = getComponentTree();
    expect(updatedTree).toEqual([
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);
  });
});

function createParsingOrchestrator(opts?: {
  getLocalDataMapping?: () => Record<string, string[]>;
  paths?: UserPaths;
  isPagesJS?: boolean;
}) {
  const { getLocalDataMapping, paths, isPagesJS } = opts ?? {};
  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    {
      paths: paths ?? userPaths,
      openBrowser: true,
      isPagesJSRepo: isPagesJS ?? false,
      port: 8080,
    },
    getLocalDataMapping
  );
  return orchestrator;
}
