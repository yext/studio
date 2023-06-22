import {
  StandardComponentState,
  ComponentStateKind,
  RepeaterState,
} from "../../src/types/ComponentState";
import {
  getComponentPath,
  getModulePath,
  getPagePath,
} from "../__utils__/getFixturePath";
import fs from "fs";
import { Project } from "ts-morph";
import {
  complexBannerComponent,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import ReactComponentFileWriter from "../../src/writers/ReactComponentFileWriter";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import {
  FileMetadataKind,
  PropShape,
  PropValueKind,
  PropValueType,
} from "../../src/types";
import StudioSourceFileWriter from "../../src/writers/StudioSourceFileWriter";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";

const propShapeMultiFields: PropShape = {
  complexBannerText: {
    type: PropValueType.string,
    doc: "some banner title!",
    required: false,
  },
  complexBannerBool: {
    type: PropValueType.boolean,
    doc: "some boolean to toggle",
    required: false,
  },
};

function createReactComponentFileWriter(
  tsMorphProject: Project,
  filepath: string,
  componentName: string
): ReactComponentFileWriter {
  const sourceFileWriter = new StudioSourceFileWriter(filepath, tsMorphProject);
  const sourceFileParser = new StudioSourceFileParser(filepath, tsMorphProject);
  return new ReactComponentFileWriter(
    componentName,
    sourceFileWriter,
    sourceFileParser
  );
}

jest.mock("uuid");

describe("updateFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTsMorphProject();
  });

  describe("React component return statement", () => {
    it("adds top-level sibling component", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const filepath = getPagePath("updatePageFile/PageWithAComponent");
      const commonComplexBannerState: Omit<StandardComponentState, "uuid"> = {
        kind: ComponentStateKind.Standard,
        componentName: "ComplexBanner",
        props: {},
        metadataUUID: "mock-metadata-uuid",
      };
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          { ...commonComplexBannerState, uuid: "mock-uuid-0" },
          { ...commonComplexBannerState, uuid: "mock-uuid-1" },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithSiblingComponents"))
      );
    });

    it("nests component with new sibling and children components", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("ComplexBanner"),
        getComponentPath("NestedBanner"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithAComponent");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: nestedBannerComponentTree,
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithNestedComponents"))
      );
    });

    it("can write repeater component", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const repeaterState: RepeaterState = {
        kind: ComponentStateKind.Repeater,
        uuid: "mock-uuid-0",
        listExpression: "document.services",
        repeatedComponent: {
          kind: ComponentStateKind.Standard,
          componentName: "ComplexBanner",
          props: {},
          metadataUUID: "mock-metadata-uuid",
        },
      };

      const filepath = getPagePath("updatePageFile/PageWithAComponent");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [repeaterState],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithRepeater"))
      );
    });

    it("can write object props", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("BannerUsingObject"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithObjectProp");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "BannerUsingObject",
            props: {
              objProp: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.Object,
                value: {
                  title: {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.string,
                    value: 'double quote -> " ',
                  },
                  subtitle: {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.string,
                    value: "the subtitle",
                  },
                  templateString: {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.string,
                    value: "`Hello ${document.world}`",
                  },
                  expression: {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.string,
                    value: "document.name",
                  },
                },
              },
            },
            uuid: "mock-uuid-0",
            metadataUUID: getComponentPath("BannerUsingObject"),
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithObjectProp.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithObjectProp"))
      );
    });

    it("can write array props", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("BannerUsingArrays"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithArrayProps");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "BannerUsingArrays",
            props: {
              arrProp: {
                kind: PropValueKind.Expression,
                valueType: PropValueType.Array,
                value: "document.services",
              },
              typeArr: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.Array,
                value: [
                  {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.number,
                    value: 1,
                  },
                  {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.number,
                    value: "document.num",
                  },
                ],
              },
              optionalArr: {
                kind: PropValueKind.Expression,
                valueType: PropValueType.Array,
                value: "",
              },
            },
            uuid: "mock-uuid-0",
            metadataUUID: getComponentPath("BannerUsingArrays"),
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithArrayProps.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithArrayProps"))
      );
    });

    it("remove components that are not part of the new component tree", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const filepath = getPagePath("updatePageFile/PageWithNestedComponents");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            props: {},
            uuid: "mock-uuid-0",
            metadataUUID: "mock-metadata-uuid",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithNestedComponents.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithAComponent"))
      );
    });
  });

  describe("imports", () => {
    it("adds css imports", () => {
      const filepath = getPagePath("updatePageFile/EmptyPage");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [fragmentComponent],
        cssImports: ["../index.css", "./App.css"],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithCssImports"))
      );
    });

    it("adds missing imports", () => {
      addFilesToProject(tsMorphProject, [
        getModulePath("PanelWithModules"),
        getComponentPath("SimpleBanner"),
      ]);
      const filepath = getPagePath("updatePageFile/EmptyPage");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          fragmentComponent,
          {
            kind: ComponentStateKind.Standard,
            componentName: "SimpleBanner",
            props: {},
            uuid: "mock-uuid-1",
            parentUUID: "mock-uuid-0",
            metadataUUID: "mock-standard-metadata-uuid",
          },
          {
            kind: ComponentStateKind.Module,
            componentName: "PanelWithModules",
            props: {},
            uuid: "mock-uuid-2",
            parentUUID: "mock-uuid-0",
            metadataUUID: "mock-module-metadata-uuid",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithComponentImports"))
      );
    });

    it("removes unused imports", () => {
      const filepath = getPagePath("updatePageFile/PageWithUnusedImports");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [fragmentComponent],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("PageWithUnusedImports.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/EmptyPage"))
      );
    });
  });

  describe("propShape", () => {
    it("adds propShape interface when it does not already exist in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithAComponent");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "Panel"
      ).updateFile({
        moduleMetadata: {
          kind: FileMetadataKind.Module,
          propShape: {
            complexBannerText: {
              type: PropValueType.string,
              doc: "title for complex banner",
              required: false,
            },
          },
          componentTree: [complexBannerComponent],
          filepath: "some/file/path",
          metadataUUID: "mock-metadata-uuid",
        },
        componentTree: [complexBannerComponent],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithPropShape"))
      );
    });

    it("updates the existing propShape interface in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithPropShape");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "Panel"
      ).updateFile({
        moduleMetadata: {
          kind: FileMetadataKind.Module,
          propShape: propShapeMultiFields,
          componentTree: [complexBannerComponent],
          filepath: "some/file/path",
          metadataUUID: "mock-metadata-uuid",
        },
        componentTree: [complexBannerComponent],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("ModuleWithPropShape.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithPropShapeMultiFields")
        )
      );
    });

    it("can update a prop interface with object props", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithPropShape");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "Panel"
      ).updateFile({
        moduleMetadata: {
          kind: FileMetadataKind.Module,
          componentTree: [complexBannerComponent],
          filepath: "some/file/path",
          metadataUUID: "mock-metadata-uuid",
          propShape: {
            obj: {
              type: PropValueType.Object,
              required: false,
              shape: {
                str: {
                  type: PropValueType.string,
                  required: false,
                },
                num: {
                  type: PropValueType.number,
                  required: false,
                },
              },
            },
          },
        },
        componentTree: [complexBannerComponent],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("ModuleWithPropShape.tsx"),
        fs.readFileSync(getModulePath("updateModuleFile/ModuleWithObjProp"))
      );
    });
  });

  describe("initialProps", () => {
    it("adds initialProps variable when it does not already exist in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithAComponent");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "Panel"
      ).updateFile({
        moduleMetadata: {
          kind: FileMetadataKind.Module,
          propShape: {
            complexBannerText: {
              type: PropValueType.string,
              doc: "title for complex banner",
              required: false,
            },
          },
          initialProps: {
            complexBannerText: {
              valueType: PropValueType.string,
              value: "Hello world!",
              kind: PropValueKind.Literal,
            },
          },
          componentTree: [complexBannerComponent],
          filepath: "some/file/path",
          metadataUUID: "mock-metadata-uuid",
        },
        componentTree: [complexBannerComponent],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithInitialProps")
        )
      );
    });

    it("updates the existing initialProps variable in file", () => {
      const filepath = getModulePath("updateModuleFile/ModuleWithInitialProps");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "Panel"
      ).updateFile({
        moduleMetadata: {
          kind: FileMetadataKind.Module,
          propShape: propShapeMultiFields,
          initialProps: {
            complexBannerText: {
              valueType: PropValueType.string,
              value: "Welcome!",
              kind: PropValueKind.Literal,
            },
            complexBannerBool: {
              valueType: PropValueType.boolean,
              value: true,
              kind: PropValueKind.Literal,
            },
          },
          componentTree: [complexBannerComponent],
          filepath: "some/file/path",
          metadataUUID: "mock-metadata-uuid",
        },
        componentTree: [complexBannerComponent],
      });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("ModuleWithInitialProps.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithInitialPropsMultiFields")
        )
      );
    });
  });

  describe("reactComponentNameSanitizer", () => {
    function testComponentNameSanitation(
      inputName: string,
      outputName: string
    ) {
      const filepath = getPagePath("updatePageFile/EmptyFile");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        inputName
      ).updateFile({ componentTree: [] });
      expect(fs.writeFileSync).toHaveWritten(
        expect.stringContaining("EmptyFile"),
        `export default function ${outputName}() {}\n`
      );
    }

    it("removes all special characters in name", () => {
      const inputName = "~'!@#%^&*()+={}[]|\\/:;\"`<>,.?- \t\r\n\f";
      const outputName = "PageDefaultFromInvalidInput";
      testComponentNameSanitation(inputName, outputName);
    });

    it("removes all leading digits in name and uppercases first letter", () => {
      const inputName = "0123456789te9st";
      const outputName = "Te9St";
      testComponentNameSanitation(inputName, outputName);
    });

    it("removes all leading non-letter unicode chars and uppercases first letter", () => {
      const inputName = "àÀصʱapple";
      const outputName = "Apple";
      testComponentNameSanitation(inputName, outputName);
    });
  });
});
