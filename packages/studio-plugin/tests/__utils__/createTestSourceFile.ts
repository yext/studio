import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import upath from "upath";

export default function createTestSourceFile(
  code: string,
  filepath = "test.tsx"
) {
  const p = createTestProject();
  p.createSourceFile(filepath, code);
  return {
    sourceFile: p.getSourceFileOrThrow(filepath),
    project: p,
  };
}

export function createTestProject() {
  return createTsMorphProject(upath.join(__dirname, "fixture-tsconfig.json"));
}
