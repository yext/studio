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
    sourceFileParser,
    jest.fn()
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithSiblingComponents"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithNestedComponents"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/PageWithRepeater"), "utf-8")
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
                },
              },
            },
            uuid: "mock-uuid-0",
            metadataUUID: getComponentPath("BannerUsingObject"),
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithObjectProp.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithObjectProp"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithNestedComponents.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithAComponent"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithCssImports"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithComponentImports"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithUnusedImports.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/EmptyPage"), "utf-8")
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithPropShape"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithPropShape.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithPropShapeMultiFields"),
          "utf-8"
        )
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithAComponent.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithInitialProps"),
          "utf-8"
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
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("ModuleWithInitialProps.tsx"),
        fs.readFileSync(
          getModulePath("updateModuleFile/ModuleWithInitialPropsMultiFields"),
          "utf-8"
        )
      );
    });
  });
});
