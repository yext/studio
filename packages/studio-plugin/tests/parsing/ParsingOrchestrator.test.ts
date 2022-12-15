import ParsingOrchestrator from "../../src/parsing/ParsingOrchestrator";
import path from "path";
import getStudioPaths from "../../src/parsing/getStudioPaths";
import { ComponentStateKind, FileMetadataKind } from "../../src";

describe("aggregates data as expected", () => {
  const studioPaths = getStudioPaths(
    path.resolve(__dirname, "../__fixtures__/ParsingOrchestrator")
  );
  const orchestrator = new ParsingOrchestrator(studioPaths);
  const studioData = orchestrator.getStudioData();

  it("getComponentMetadata", () => {
    expect(studioData.componentMetadata).toEqual([
      expect.objectContaining({
        kind: FileMetadataKind.Component,
        propShape: expect.anything(),
      }),
      expect.objectContaining({
        kind: FileMetadataKind.Component,
        propShape: expect.anything(),
        acceptsChildren: true,
      }),
    ]);
  });

  it("getModuleMetadata", () => {
    expect(studioData.moduleMetadata).toEqual([
      {
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ componentName: "NestedBanner" }),
          expect.objectContaining({ componentName: "Card" }),
        ],
        initialProps: expect.anything(),
        propShape: expect.anything(),
      },
      {
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ kind: ComponentStateKind.Fragment }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
        ],
        propShape: expect.anything(),
      },
    ]);
  });

  it("getPages", () => {
    expect(studioData.pages).toEqual({
      basicPage: {
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
        cssImports: [],
      },
      pageWithModules: {
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
        cssImports: [],
      },
    });
  });

  it("getSiteSettings", () => {
    expect(studioData.siteSettings).toEqual({
      shape: expect.anything(),
      values: expect.anything(),
    });
  });
});

it("behavior when expected folders except for pages do not exist", () => {
  const studioPaths = getStudioPaths("thisFolderDoesNotExist");
  studioPaths.pages = path.resolve(
    __dirname,
    "../__fixtures__/ParsingOrchestrator/pages"
  );

  const orchestrator = new ParsingOrchestrator(studioPaths);
  const studioData = orchestrator.getStudioData();

  expect(studioData).toEqual({
    componentMetadata: [],
    moduleMetadata: [],
    pages: expect.anything(),
  });
});

it("throws when the pages folder does not exist", () => {
  const studioPaths = getStudioPaths(
    path.resolve(__dirname, "../__fixtures__/ParsingOrchestrator")
  );
  studioPaths.pages = "thisFolderDoesNotExist";

  const orchestrator = new ParsingOrchestrator(studioPaths);
  expect(() => orchestrator.getStudioData()).toThrow(
    /^The pages directory does not exist/
  );
});
