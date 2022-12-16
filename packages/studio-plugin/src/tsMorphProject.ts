import { Project } from "ts-morph";
import typescript from "typescript";

/**
 * The ts-morph Project instance for the entire app.
 */
export const tsMorphProject = new Project({
  compilerOptions: {
    jsx: typescript.JsxEmit.ReactJSX,
  },
});
