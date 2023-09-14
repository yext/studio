import fs from "fs";
import upath from "upath";

export default function initNameToSourceFile<SourceFile>(
  dirPath: string,
  getSourceFile: (name: string) => SourceFile
): Record<string, SourceFile> {
  const files = fs.readdirSync(dirPath, "utf-8").filter((filename) => {
    const absPath = upath.join(dirPath, filename);
    return fs.lstatSync(absPath).isFile();
  });
  return files.reduce((sourceFileMap, filename) => {
    const name = upath.basename(filename, ".tsx");
    sourceFileMap[name] = getSourceFile(name);
    return sourceFileMap;
  }, {} as Record<string, SourceFile>);
}
