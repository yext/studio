import PageFile from "../../src/parsing/PageFile";
import { ComponentState, ComponentStateKind } from "../../src/types/State";
import { PropValueKind, PropValueType } from "../../src/types/PropValues";
import path from "path";

jest.mock("uuid", () => ({ v4: () => "mock-uuid" }));

const componentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 1
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "first!"
      }
    },
    uuid: "mock-uuid",
    parentUUID: "mock-uuid",
    metadataUUID: getComponentPath("ComplexBanner")
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {},
    uuid: "mock-uuid",
    parentUUID: "mock-uuid",
    metadataUUID: getComponentPath("ComplexBanner")
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 3
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "three"
      },
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: false
      }
    },
    uuid: "mock-uuid",
    parentUUID: "mock-uuid",
    metadataUUID: getComponentPath("ComplexBanner")
  }
];

it("correctly parses page with top-level React.Fragment", () => {
  const pageFile = new PageFile(getPagePath("reactFragmentPage"));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: "mock-uuid",
    },
    ...componentTree
  ]);
});

it("correctly parses page with top-level Fragment", () => {
  const pageFile = new PageFile(getPagePath("fragmentPage"));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: "mock-uuid",
    },
    ...componentTree
  ]);
});

it("correctly parses page with top-level Fragment in short syntax", () => {
  const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Fragment,
      uuid: "mock-uuid",
    },
    ...componentTree
  ]);
});

it("correctly parses page with top-level div component and logs warning", () => {
  const consoleWarnSpy = jest.spyOn(global.console, "warn").mockImplementation();
  const pageFile = new PageFile(getPagePath("divPage"));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Standard,
      componentName: "div",
      props: {},
      uuid: "mock-uuid",
      metadataUUID: "builtIn"
    },
    ...componentTree
  ]);

  expect(consoleWarnSpy).toBeCalledWith("Props for builtIn element: 'div' are currently not supported.");
});

it("correctly parses page with nested banner components", () => {
  const pageFile = new PageFile(getPagePath("nestedBannerPage"));
  const result = pageFile.getPageState();

  expect(result.componentTree).toEqual([
    {
      kind: ComponentStateKind.Standard,
      componentName: "NestedBanner",
      props: {},
      uuid: "mock-uuid",
      metadataUUID: getComponentPath("NestedBanner")
    },
    componentTree[0],
    componentTree[1],
    {
      kind: ComponentStateKind.Standard,
      componentName: "NestedBanner",
      props: {},
      uuid: "mock-uuid",
      parentUUID: "mock-uuid",
      metadataUUID: getComponentPath("NestedBanner")
    },
    componentTree[2]
  ]);
});

it("correctly parses CSS imports", () => {
  const pageFile = new PageFile(getPagePath("shortFragmentSyntaxPage"));
  const result = pageFile.getPageState();

  expect(result.cssImports).toEqual([
    "./index.css",
    "@yext/search-ui-react/index.css"
  ]);
});

it("throws an error when no return statement is found in the default export", () => {
  const pageFile = new PageFile(getPagePath("noReturnStatementPage"));

  expect(() =>  pageFile.getPageState()).toThrowError(
    /^No return statement found for the default export at path: /
  );
});

it("throws an error when the return statement has no top-level Jsx node", () => {
  const pageFile = new PageFile(getPagePath("noTopLevelJsxPage"));

  expect(() =>  pageFile.getPageState()).toThrowError(
    /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
  );
});


it("throws an error when a JsxSpreadAttribute is found on the page", () => {
  const pageFile = new PageFile(getPagePath("jsxSpreadAttributePage"));

  expect(() =>  pageFile.getPageState()).toThrowError(
    "JsxSpreadAttribute is not currently supported."
  );
});

it("throws an error when JsxText is found on the page", () => {
  const pageFile = new PageFile(getPagePath("jsxTextPage"));

  expect(() =>  pageFile.getPageState()).toThrowError(
    "Found JsxText with content \"Text\". JsxText is not currently supported."
  );
});

it("throws an error when a JsxExpression is found on the page", () => {
  const pageFile = new PageFile(getPagePath("jsxExpressionPage"));

  expect(() =>  pageFile.getPageState()).toThrowError(
    "Jsx nodes of kind \"JsxExpression\" are not supported for direct use in page files."
  );
});

function getPagePath(pageName: string) {
  return path.resolve(
    __dirname,
    `../__fixtures__/PageFile/${pageName}.tsx`
  );
}

function getComponentPath(componentName: string) {
  return path.resolve(
    __dirname,
    `../__fixtures__/ComponentFile/${componentName}.tsx`
  );
}
