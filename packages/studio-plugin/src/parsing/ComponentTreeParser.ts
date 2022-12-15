export default class ComponentTreeParser {
  constructor(protected filepath: string, private getFileMetadata: GetFileMetadata, project: Project) {
  if (!project.getSourceFile(filepath)) {
    project.addSourceFileAtPath(filepath);
  }
  this.sourceFile = project.getSourceFileOrThrow(filepath);
}

}