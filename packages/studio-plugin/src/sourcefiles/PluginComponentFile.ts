import ComponentFile from "./ComponentFile";
import { Project } from "ts-morph";

export default class PluginComponentFile extends ComponentFile {
  constructor(filepath: string, project: Project) {
    super(filepath, project);
    this.setComponentName("TempComp");
  }
}