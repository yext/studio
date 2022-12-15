import ParsingOrchestrator from "../../src/parsing/ParsingOrchestrator";
import path from "path";
import getStudioPaths from "../../src/parsing/getStudioPaths";
import { ComponentStateKind, FileMetadataKind } from "../../src";

describe("aggregates data as expected", () => {
  const studioPaths = getStudioPaths(
    path.resolve(__dirname, "../__fixtures__/ParsingOrchestrator")
  );
  const orchestrator = new ParsingOrchestrator(studioPaths);

  it("getComponentMetadata", () => {
    expect(orchestrator.getComponentMetadata()).toEqual([
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
    expect(orchestrator.getModuleMetadata()).toEqual([
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
    expect(orchestrator.getPages()).toEqual({
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
    expect(orchestrator.getSiteSettings()).toEqual({
      shape: expect.anything(),
      values: expect.anything(),
    });
  });
});

describe("behavior when expected folders do not exist", () => {
  const studioPaths = getStudioPaths(
    path.resolve(__dirname, "thisFolderDoesNotExist")
  );
  const orchestrator = new ParsingOrchestrator(studioPaths);

  it("getComponentMetadata", () => {
    expect(orchestrator.getComponentMetadata()).toEqual([]);
  });

  it("getModuleMetadata", () => {
    expect(orchestrator.getModuleMetadata()).toEqual([]);
  });

  it("getPages", () => {
    expect(() => orchestrator.getPages()).toThrow(
      /^The pages directory does not exist/
    );
  });

  it("getSiteSettings", () => {
    expect(orchestrator.getSiteSettings()).toEqual(undefined);
  });
});
