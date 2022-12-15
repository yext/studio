import ParsingOrchestrator from "../../src/parsing/ParsingOrchestrator";
import path from "path";
import getStudioPaths from "../../src/parsing/getStudioPaths";
import { ComponentStateKind, FileMetadataKind } from "../../src";

it("getComponentMetadata", () => {
  const orchestrator = createOrchestrator();
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
  const orchestrator = createOrchestrator();
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
  const orchestrator = createOrchestrator();
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

function createOrchestrator() {
  const studioPaths = getStudioPaths(
    path.resolve(__dirname, "../__fixtures__/ParsingOrchestrator")
  );
  return new ParsingOrchestrator(studioPaths);
}
