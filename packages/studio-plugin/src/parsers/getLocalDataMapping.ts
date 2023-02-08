import { join } from "path";
import { existsSync } from "fs";

export default async function getLocalDataMapping(
  localDataPath: string
): Promise<Record<string, string[]> | undefined> {
  const streamMappingFile = "mapping.json";
  const localDataMappingFilepath = join(localDataPath, streamMappingFile);
  if (!existsSync(localDataMappingFilepath)) {
    throw new Error(
      `The localData's ${streamMappingFile} does not exist, expected the file to be at "${localDataMappingFilepath}".`
    );
  }
  const mapping = await import(/* @vite-ignore */ localDataMappingFilepath);
  return mapping.default;
}
