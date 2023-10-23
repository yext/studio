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
import upath from "upath";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private fileMetadataParser: FileMetadataParser;

  constructor(
    filepath: string,
    project: Project,
    private dependencyTree: Tree
  ) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.fileMetadataParser = new FileMetadataParser(
      this.studioSourceFileParser
    );
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
    this.studioSourceFileParser.checkForMissingImports();
    let acceptsChildren = false;
    const onProp = (propName: string): boolean => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
      }
      return propName !== SpecialReactProps.Children;
    };

    const filepath = this.studioSourceFileParser.getFilepath();
    const cssImports = getCssFilesFromDependencyTree(this.dependencyTree);
    return {
      kind: FileMetadataKind.Component,
      ...this.fileMetadataParser.parse(onProp),
      ...(acceptsChildren ? { acceptsChildren } : {}),
      filepath,
      cssImports,
    };
  };
}

function getCssFilesFromDependencyTree(dependencyTree: Tree): string[] {
  const cssFiles = Object.entries(dependencyTree).reduce(
    (cssFiles, [absFilepath, subDependencyTree]) => {
      if (absFilepath.endsWith(".css")) {
        cssFiles.add(upath.toUnix(absFilepath));
      }
      return new Set([
        ...cssFiles,
        ...getCssFilesFromDependencyTree(subDependencyTree),
      ]);
    },
    new Set<string>()
  );
  return [...cssFiles];
}
