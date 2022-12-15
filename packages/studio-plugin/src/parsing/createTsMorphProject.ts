import { Project } from "ts-morph";
import typescript from "typescript";

export default function createTsMorphProject() {
  return new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
}
