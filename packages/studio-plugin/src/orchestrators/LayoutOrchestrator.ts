import { Project } from "ts-morph";
import ComponentTreeParser from "../parsers/ComponentTreeParser";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";
import LayoutFile from "../sourcefiles/LayoutFile";
import { FileMetadata, LayoutState, UserPaths } from "../types";
import createFilenameMapping from "./createFilenameMapping";
import fs from "fs";
import upath from "upath";
import separateErrorAndSuccessResults from "./separateErrorAndSuccessResults";

export default class LayoutOrchestrator {
  private layoutNameToLayoutFile: Record<string, LayoutFile> = {};

  constructor(
    private paths: UserPaths,
    private project: Project,
    private getFileMetadata: (absPath: string) => FileMetadata
  ) {
    this.layoutNameToLayoutFile = this.initLayoutNameToLayoutFile();
  }

  getLayoutNameToLayoutState(): Record<string, LayoutState> {
    return separateErrorAndSuccessResults(
      this.layoutNameToLayoutFile,
      (layoutFile) => layoutFile.getLayoutState()
    ).successes;
  }

  refreshLayoutFile(filepath: string, fileExists: boolean) {
    const layoutName = upath.basename(filepath, ".tsx");
    delete this.layoutNameToLayoutFile[layoutName];
    if (fileExists) {
      this.layoutNameToLayoutFile[layoutName] =
        this.createLayoutFile(layoutName);
    }
  }

  getOrCreateLayoutFile = (layoutName: string): LayoutFile => {
    const layoutFile = this.layoutNameToLayoutFile[layoutName];
    if (layoutFile) {
      return layoutFile;
    }
    return this.createLayoutFile(layoutName);
  };

  private createLayoutFile = (layoutName: string) => {
    const filepath = upath.join(this.paths.layouts, layoutName + ".tsx");
    const studioSourceFileParser = new StudioSourceFileParser(
      filepath,
      this.project
    );
    const componentTreeParser = new ComponentTreeParser(
      studioSourceFileParser,
      this.getFileMetadata
    );
    return new LayoutFile(studioSourceFileParser, componentTreeParser);
  };

  private initLayoutNameToLayoutFile(): Record<string, LayoutFile> {
    if (!fs.existsSync(this.paths.layouts)) {
      return {};
    }
    return createFilenameMapping(
      this.paths.layouts,
      this.getOrCreateLayoutFile
    );
  }
}
