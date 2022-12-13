import PageFile from "../../src/parsing/PageFile";
import { ComponentState, ComponentStateKind } from "../../src/types/State";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import { getComponentPath, getModulePath, getPagePath } from "../__utils__/getFixturePath";
import * as getFileMetadataUtils from "../../src/getFileMetadata";
import * as uuidUtils from "uuid";
import fs from "fs";
import { FileMetadataKind, PropShape } from "../../src";
import ComponentFile from "../../src/parsing/ComponentFile";
import typescript from "typescript";
import { Project } from "ts-morph";

jest.mock("uuid");

const fragmentComponent: ComponentState = {
  kind: ComponentStateKind.Fragment,
  uuid: "mock-uuid-0",
}

const componentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 1,
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "first!",
      },
    },
    uuid: "mock-uuid-1",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {},
    uuid: "mock-uuid-2",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 3,
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "three",
      },
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: false,
      },
    },
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
];

const nestedBannerComponentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "NestedBanner",
    props: {},
    uuid: "mock-uuid-0",
    metadataUUID: getComponentPath("NestedBanner"),
  },
  componentTree[0],
  componentTree[1],
  {
    kind: ComponentStateKind.Standard,
    componentName: "NestedBanner",
    props: {},
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("NestedBanner"),
  },
  {
    ...componentTree[2],
    parentUUID: "mock-uuid-3",
    uuid: "mock-uuid-4",
  },
]

const streamConfigMultipleFieldsComponentTree: ComponentState[] = [
  fragmentComponent,
  {
    kind: ComponentStateKind.Standard,
    componentName: 'SimpleBanner',
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-1",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "document.title",
        valueType: PropValueType.string
      }
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: 'SimpleBanner',
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-2",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "`this is ${document.stringLiteral}`",
        valueType: PropValueType.string
      }
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: 'SimpleBanner',
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-3",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "document.arrayIndex[0]",
        valueType: PropValueType.string
      }
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: 'SimpleBanner',
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-4",
    props: {
      title: {
        kind: PropValueKind.Literal,
        value:'document.notAStreamField',
        valueType: PropValueType.string
      }
    },
  }
]

describe("getPageState", () => {
  beforeEach(() => {
    let uuidCount = 0;
    jest.spyOn(uuidUtils, "v4").mockImplementation(() => {
      return `mock-uuid-${uuidCount++}`;
    });
    jest
      .spyOn(getFileMetadataUtils, "getFileMetadata")
      .mockImplementation((filepath) => {
        let propShape: PropShape = {};
        if (filepath?.includes("ComplexBanner")) {
          propShape = {
            title: { type: PropValueType.string, doc: "jsdoc" },
            num: { type: PropValueType.number },
            bool: { type: PropValueType.boolean },
            bgColor: { type: PropValueType.HexColor },
          };
        } else if (filepath?.includes("NestedBanner")) {
          propShape = {};
        }

        return {
          kind: FileMetadataKind.Component,
          metadataUUID: filepath,
          propShape,
        };
      });
  });

  it("correctly parses page with top-level React.Fragment", () => {
    const pageFile = new PageFile(getPagePath("reactFragmentPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level Fragment", () => {
    const pageFile = new PageFile(getPagePath("fragmentPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level Fragment in short syntax", () => {
    const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      ...componentTree,
    ]);
  });

  it("correctly parses page with top-level div component and logs warning", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const pageFile = new PageFile(getPagePath("divPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      {
        kind: ComponentStateKind.Standard,
        componentName: "div",
        props: {},
        uuid: "mock-uuid-0",
      },
      ...componentTree,
    ]);

    expect(consoleWarnSpy).toBeCalledWith(
      "Props for builtIn element: 'div' are currently not supported."
    );
  });

  it("correctly parses page with nested banner components", () => {
    const pageFile = new PageFile(getPagePath("nestedBannerPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual(nestedBannerComponentTree);
  });

  it("correctly parses page with variable statement and no parentheses around return statement", () => {
    const pageFile = new PageFile(getPagePath("noReturnParenthesesPage"));
    const result = pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      {
        ...componentTree[1],
        uuid: "mock-uuid-1",
      },
    ]);
  });

  it("correctly parses CSS imports", () => {
    const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
    const result = pageFile.getPageState();

    expect(result.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  describe("throws errors", () => {
    it("throws an error when no return statement is found in the default export", () => {
      const pageFile = new PageFile(getPagePath("noReturnStatementPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^No return statement found for the default export at path: /
      );
    });

    it("throws an error when the return statement has no top-level Jsx node", () => {
      const pageFile = new PageFile(getPagePath("noTopLevelJsxPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
    });

    it("throws an error when a JsxSpreadAttribute is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxSpreadAttributePage"));

      expect(() => pageFile.getPageState()).toThrowError(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxTextPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        'Found JsxText with content "\n      Text\n      ". JsxText is not currently supported.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", () => {
      const pageFile = new PageFile(getPagePath("jsxExpressionPage"));

      expect(() => pageFile.getPageState()).toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });
  });
});

describe("updatePageFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, 'writeFileSync').mockImplementation();
    tsMorphProject = new Project({
      compilerOptions: {
        jsx: typescript.JsxEmit.ReactJSX,
      },
    });
  })

  describe("page return statement", () => {
    it("adds new sibling and children components", () => {
      new ComponentFile(getComponentPath("ComplexBanner"), tsMorphProject);
      new ComponentFile(getComponentPath("NestedBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/PageWithAComponent"), tsMorphProject);
      pageFile.updatePageFile({
        componentTree: nestedBannerComponentTree,
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('PageWithAComponent.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithMultipleComponents'), 'utf-8')
      )
    })

    it("remove components that are not part of the new page's component tree", () => {
      new ComponentFile(getComponentPath("ComplexBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/PageWithMultipleComponents"), tsMorphProject);
      pageFile.updatePageFile({
        componentTree: [{
          kind: ComponentStateKind.Standard,
          componentName: "ComplexBanner",
          props: {},
          uuid: "mock-uuid-0",
        }],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('PageWithMultipleComponents.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithAComponent'), 'utf-8')
      )
    })
  })

  describe("stream config", () => {
    beforeEach(() => {
      jest.spyOn(uuidUtils, "v4").mockReturnValue('mock-uuid-value');
    })

    it("adds template config variable when it is not already defined", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/EmptyPage"), tsMorphProject);
      pageFile.updatePageFile(
        {
          componentTree: [{
            kind: ComponentStateKind.Standard,
            componentName: 'SimpleBanner',
            uuid: "mock-uuid-0",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: 'document.title',
                valueType: PropValueType.string
              }
            },
          }],
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('EmptyPage.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithStreamConfig'), 'utf-8')
      )
    })

    it("adds new stream document paths used in new page state", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/EmptyPage"), tsMorphProject);
      pageFile.updatePageFile(
        {
          componentTree: streamConfigMultipleFieldsComponentTree,
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('EmptyPage.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithStreamConfigMultipleFields'), 'utf-8')
      )
    })

    it("removes unused stream document paths", () => {
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/PageWithStreamConfigMultipleFields"), tsMorphProject);
      pageFile.updatePageFile(
        {
          componentTree: [{
            kind: ComponentStateKind.Standard,
            componentName: 'SimpleBanner',
            uuid: "mock-uuid-0",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: 'document.title',
                valueType: PropValueType.string
              }
            },
          }],
          cssImports: [],
        },
        { updateStreamConfig: true }
      );
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('PageWithStreamConfigMultipleFields.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithStreamConfig'), 'utf-8')
      )
    })
  })

  describe("imports", () => {
    it("adds css imports", () => {
      const pageFile = new PageFile(getPagePath("updatePageFile/EmptyPage"), tsMorphProject);
      pageFile.updatePageFile({
        componentTree: [fragmentComponent],
        cssImports: ['../index.css', './App.css'],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('EmptyPage.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithCssImports'), 'utf-8')
      )
    });

    it("adds missing imports", () => {
      new ComponentFile(getModulePath("PanelWithModules"), tsMorphProject);
      new ComponentFile(getComponentPath("SimpleBanner"), tsMorphProject);
      const pageFile = new PageFile(getPagePath("updatePageFile/EmptyPage"), tsMorphProject);
      pageFile.updatePageFile({
        componentTree: [
          fragmentComponent,
          {
            kind: ComponentStateKind.Standard,
            componentName: 'SimpleBanner',
            props: {},
            uuid: "mock-uuid-1",
            parentUUID: "mock-uuid-0"
          },
          {
            kind: ComponentStateKind.Module,
            componentName: 'PanelWithModules',
            props: {},
            uuid: "mock-uuid-2",
            parentUUID: "mock-uuid-0"
          }
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('EmptyPage.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/PageWithComponentImports'), 'utf-8')
      )
    });

    it("removes unused imports", () => {
      const pageFile = new PageFile(getPagePath("updatePageFile/PageWithUnusedImports"), tsMorphProject);
      pageFile.updatePageFile({
        componentTree: [fragmentComponent],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('PageWithUnusedImports.tsx'),
        fs.readFileSync(getPagePath('updatePageFile/EmptyPage'), 'utf-8')
      )
    });
  })
});
