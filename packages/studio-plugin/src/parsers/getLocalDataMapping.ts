import { join } from "path";
import { existsSync } from "fs";

/**
 * Import the user's localData/mapping.json file, so that studio can find the user's test data.
 */
export default async function getLocalDataMapping(
  localDataPath: string
): Promise<Record<string, string[]>> {
  const streamMappingFile = "mapping.json";
  const localDataMappingFilepath = join(localDataPath, streamMappingFile);
  if (!existsSync(localDataMappingFilepath)) {
    throw new Error(
      `The localData's ${streamMappingFile} does not exist, expected the file to be at "${localDataMappingFilepath}".`
    );
  }
  const mapping = await import(localDataMappingFilepath, {
    assert: { type: "json" },
  });
  return mapping.default;
}
