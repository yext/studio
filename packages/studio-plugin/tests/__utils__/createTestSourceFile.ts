import { createTsMorphProject } from "../../src/ParsingOrchestrator";

export default function createTestSourceFile(code: string) {
  const p = createTsMorphProject();
  p.createSourceFile("test.tsx", code);
  return {
    sourceFile: p.getSourceFileOrThrow("test.tsx"),
    project: p,
  };
}
