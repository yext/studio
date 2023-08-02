import { spawnSync } from "child_process";
import { registerListener } from "./registerListener";
import { ViteDevServer } from "vite";
import { MessageID, GenerateTestDataPayload } from "../types";
import { FeaturesJson } from "../types/PagesJS";
import LocalDataMappingManager from "../LocalDataMappingManager";

/**
 * Registers a listener for generating test data.
 */
export default function registerGenerateTestData(
  server: ViteDevServer,
  mappingManager: LocalDataMappingManager
) {
  registerListener(
    server,
    MessageID.GenerateTestData,
    ({ featuresJson }: GenerateTestDataPayload) => {
      const msg = generateTestData(featuresJson);
      mappingManager.refreshMapping();
      return { type: "success", msg, mappingJson: mappingManager.getMapping() };
    }
  );
}

/**
 * Spawns a `yext pages generate-test-data -a` call with the given FeaturesJson.
 */
function generateTestData(featuresJson: FeaturesJson) {
  const prepareJsonForCmd = (json: FeaturesJson) => {
    if (process.platform === "win32") {
      return `${JSON.stringify(json).replace(/([\\]*)"/g, `$1$1\\"`)}`;
    } else {
      return `'${JSON.stringify(json)}'`;
    }
  };
  const stringifiedFeaturesJson = prepareJsonForCmd(featuresJson);

  const output = spawnSync(
    "yext",
    [
      "pages",
      "generate-test-data",
      "-a",
      "--featuresConfig",
      stringifiedFeaturesJson,
    ],
    {
      stdio: "inherit",
      shell: true,
      windowsVerbatimArguments: true,
    }
  );

  if (output.status !== 0) {
    throw new Error("Could not generate test data.");
  }
  return "Successfully generated test data.";
}
