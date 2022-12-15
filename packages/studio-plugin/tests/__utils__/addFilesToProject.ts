import { Project } from "ts-morph";

export function addFilesToProject(project: Project, filepaths: string[]) {
  filepaths.forEach((filepath) => {
    if (!project.getSourceFile(filepath)) {
      project.addSourceFileAtPath(filepath);
    }
  });
}
