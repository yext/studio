import { ComponentMetadata } from "../types/ComponentMetadata";
import { SpecialReactProps } from "../types/PropShape";
import { FileMetadataKind } from "../types/FileMetadata";
import FileMetadataParser from "../parsers/FileMetadataParser";
import { Project } from "ts-morph";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import tryUsingResult from "../errors/tryUsingResult";
import { ParsingError, ParsingErrorKind } from "../errors/ParsingError";
import { Result } from "true-myth";
import { Tree } from "dependency-tree";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private fileMetadataParser: FileMetadataParser;
  private moduleGraph: Tree;

  constructor(filepath: string, project: Project, moduleGraph: Tree) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.studioSourceFileParser
    );
    this.moduleGraph = moduleGraph;
  }

  getComponentMetadata(): Result<ComponentMetadata, ParsingError> {
    return tryUsingResult(
      ParsingErrorKind.FailedToParseComponentMetadata,
      `Failed to parse ComponentMetadata for "${this.studioSourceFileParser.getFilepath()}"`,
      this._getComponentMetadata
    );
  }

  private _getComponentMetadata = (): ComponentMetadata => {
    this.studioSourceFileParser.checkForSyntaxErrors();
    let acceptsChildren = false;
    const onProp = (propName: string): boolean => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
      }
      return propName !== SpecialReactProps.Children;
    };

    const filepath = this.studioSourceFileParser.getFilepath();
    const cssImports = getCssFilesFromModuleGraph(this.moduleGraph);
    return {
      kind: FileMetadataKind.Component,
      ...this.fileMetadataParser.parse(onProp),
      ...(acceptsChildren ? { acceptsChildren } : {}),
      filepath,
      cssImports,
    };
  };
}

function getCssFilesFromModuleGraph(moduleGraph: Tree): string[] {
  let cssFiles: Set<string> = new Set();
  Object.entries(moduleGraph).forEach(([key, val]) => {
    if (key.includes(".css")) {
      cssFiles.add(key);
    }
    cssFiles = new Set([...cssFiles, ...getCssFilesFromModuleGraph(val)]);
  });
  return Array.from(cssFiles);
}
