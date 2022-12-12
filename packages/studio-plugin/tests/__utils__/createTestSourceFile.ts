import { Project } from "ts-morph";
import typescript from "typescript";

export default function createTestSourceFile(code: string) {
  const p = new Project({
    compilerOptions: {
      jsx: typescript.JsxEmit.ReactJSX,
    },
  });
  p.createSourceFile("test.tsx", code);
  return {
    sourceFile: p.getSourceFileOrThrow("test.tsx"),
    project: p,
  };
}
