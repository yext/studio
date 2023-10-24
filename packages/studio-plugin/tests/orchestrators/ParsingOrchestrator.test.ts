import ParsingOrchestrator from "../../src/orchestrators/ParsingOrchestrator";
import getUserPaths from "../../src/parsers/getUserPaths";
import upath from "upath";
import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
  PropValueKind,
  StudioData,
  UserPaths,
} from "../../src/types";
import { Project } from "ts-morph";
import fs from "fs";
import prettyPrintError from "../../src/errors/prettyPrintError";
import { assertIsOk } from "../__utils__/asserts";
import { createTestProject } from "../__utils__/createTestSourceFile";
import { getFixturePath } from "../__utils__/getFixturePath";

jest.mock("../../src/errors/prettyPrintError");

const projectRoot = upath.resolve(
  __dirname,
  "../__fixtures__/ParsingOrchestrator"
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
  styleImports: [],
};

describe("aggregates data as expected", () => {
  const orchestrator = createParsingOrchestrator();
  let studioData: StudioData;

  beforeAll(() => {
    studioData = orchestrator.getStudioData();
  });

  it("properly populates UUIDToFileMetadata", () => {
    const fileMetadataArray = Object.values(studioData.UUIDToFileMetadata);
    const expectedIndexCssPath = getFixturePath(
      "ParsingOrchestrator/src/styles/index.css"
    );
    const expectedSassyScssPath = getFixturePath(
      "ParsingOrchestrator/src/styles/sassy.scss"
    );
    expect(fileMetadataArray).toHaveLength(2);
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/Card.tsx"),
        kind: FileMetadataKind.Component,
        styleImports: [expectedIndexCssPath, expectedSassyScssPath],
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/NestedBanner.tsx"),
        kind: FileMetadataKind.Component,
        acceptsChildren: true,
      })
    );
  });

  it("properly populates pageNameToPageState, ignoring sub-directories", () => {
    expect(studioData.pageNameToPageState).toEqual({
      basicPage: basicPageState,
    });
  });

  it("properly populates siteSettings", () => {
    expect(studioData.siteSettings).toEqual({
      shape: expect.anything(),
      values: expect.anything(),
    });
  });

  it("properly populates layouts, ignoring sub-directories", () => {
    expect(studioData.layoutNameToLayoutState).toEqual({
      BasicLayout: {
        componentTree: [
          expect.objectContaining({
            componentName: "div",
            kind: ComponentStateKind.BuiltIn,
            parentUUID: undefined,
          }),
          expect.objectContaining({
            componentName: "Card",
            kind: ComponentStateKind.Standard,
          }),
        ],
        filepath: expect.stringContaining("layouts/BasicLayout.tsx"),
        styleImports: [],
      },
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
      });
    });
  });
});

it("throws an error when the page imports components from unexpected folders", () => {
  const userPaths = getUserPaths("thisFolderDoesNotExist");
  userPaths.pages = upath.resolve(
    __dirname,
    "../__fixtures__/ParsingOrchestrator/src/pages"
  );
  createParsingOrchestrator({ paths: userPaths }).getStudioData();
  expect(prettyPrintError).toHaveBeenCalledTimes(1);
  expect(prettyPrintError).toHaveBeenCalledWith(
    expect.stringMatching(/^Failed to parse PageState/),
    expect.stringMatching(/^Error: Could not get FileMetadata for/)
  );
});

it("throws when the pages folder does not exist", () => {
  const userPaths = getUserPaths(
    upath.resolve(__dirname, "../__fixtures__/ParsingOrchestrator")
  );
  userPaths.pages = "thisFolderDoesNotExist";
  expect(() => createParsingOrchestrator({ paths: userPaths })).toThrow(
    /^The pages directory does not exist/
  );
});

it("throws an error when a layout imports components from unexpected folder", () => {
  const updatedUserPaths = {
    ...userPaths,
    components: "thisFolderDoesNotExist",
  };
  createParsingOrchestrator({ paths: updatedUserPaths }).getStudioData();
  expect(prettyPrintError).toHaveBeenCalledWith(
    expect.stringMatching(/^Failed to parse LayoutState/),
    expect.stringMatching(/^Error: Could not get FileMetadata for/)
  );
});

it("gracefully handles layouts folder that does not exist", () => {
  const updatedUserPaths = { ...userPaths, layouts: "thisFolderDoesNotExist" };
  const parsingOrchestrator = createParsingOrchestrator({
    paths: updatedUserPaths,
  });
  expect(parsingOrchestrator.getStudioData().layoutNameToLayoutState).toEqual(
    {}
  );
});

describe("reloadFile", () => {
  const userPaths = getUserPaths(
    upath.resolve(__dirname, "../__fixtures__/ParsingOrchestrator.reloadFile")
  );
  const filepath = upath.join(userPaths.pages, "reloadFilePage.tsx");
  const originalFile = fs.readFileSync(filepath, "utf-8");
  const layoutPath = upath.join(userPaths.layouts, "BasicLayout.tsx");
  const originalLayoutFile = fs.readFileSync(layoutPath, "utf-8");
  const orchestrator = createParsingOrchestrator({ paths: userPaths });

  afterEach(() => {
    fs.writeFileSync(filepath, originalFile);
    fs.writeFileSync(layoutPath, originalLayoutFile);
  });

  it("reloadFile can reload a file", () => {
    const updatedFile = `
    import Banner from "../components/Banner"

    export default function reloadFilePage() {
      return (
        <>
        <Banner />
        </>
      );
    }
  `;
    const getComponentTree = () => {
      const pageState = orchestrator
        .getOrCreatePageFile("reloadFilePage")
        .getPageState();
      assertIsOk(pageState);
      return pageState.value.componentTree;
    };

    const originalTree = getComponentTree();
    expect(originalTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Fragment,
      }),
    ]);

    fs.writeFileSync(filepath, updatedFile);
    orchestrator.reloadFile(filepath);
    const updatedTree = getComponentTree();
    expect(updatedTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Fragment,
      }),
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);
  });

  it("reloadFile can reload a layout file", () => {
    const updatedLayoutFile = `
    import Banner from "../components/Banner";

    export default function BasicLayout() {
      return <Banner />;
    }
  `;
    const getComponentTree = () => {
      const layout =
        orchestrator.getStudioData().layoutNameToLayoutState["BasicLayout"];
      return layout.componentTree;
    };
    const originalTree = getComponentTree();
    expect(originalTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Fragment,
      }),
    ]);

    fs.writeFileSync(layoutPath, updatedLayoutFile);
    orchestrator.reloadFile(layoutPath);
    const updatedTree = getComponentTree();
    expect(updatedTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Standard,
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
  const tsMorphProject: Project = createTestProject();
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
