import { createTsMorphProject } from "../../src/ParsingOrchestrator";

export default function createTestSourceFile(
  code: string,
  filepath = "test.tsx"
) {
  const p = createTsMorphProject();
  p.createSourceFile(filepath, code);
  return {
    sourceFile: p.getSourceFileOrThrow(filepath),
    project: p,
  };
}
