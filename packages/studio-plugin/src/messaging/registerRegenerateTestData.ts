import { Stream } from "@yext/pages/*";
import { spawnSync } from "child_process";
import fs from "fs";
import upath from "upath";
import { registerListener } from "./registerListener";
import { ViteDevServer } from "vite";
import { MessageID, RegenerateTestDataPayload, StreamScope } from "../types";

/**
 * Registers a listener for regenerating test data.
 */
export default function registerRegenerateTestData(
  server: ViteDevServer,
  pathToUserProjectRoot: string
) {
  registerListener(
    server,
    MessageID.RegenerateTestData,
    ({ pageName, streamScope }: RegenerateTestDataPayload) => {
      const streamId = `studio-stream-id-${pageName}`;

      const stream = getStreamFromStreamScope(streamScope, streamId);
      const entityFeature = getEntityFeature(pageName, streamId);
      const featuresJson = readFeaturesJson(pathToUserProjectRoot);

      return regenerateTestData(stream, entityFeature, featuresJson);
    }
  );
}

function getStreamFromStreamScope(
  streamScope: StreamScope,
  streamId: string
): Stream {
  return {
    $id: streamId,
    localization: {
      locales: ["en"],
      primary: false,
    },
    filter: streamScope,
    // We will be requesting all fields with the `-a` flag.
    fields: ["meta"],
  };
}

/**
 * Converts a {@link TemplateConfigInternal} into a valid single {@link FeatureConfig}.
 */
function getEntityFeature(pageName: string, streamId: string): EntityFeature {
  return {
    name: pageName,
    streamId: streamId,
    templateType: "JS",
    entityPageSet: {
      plugin: {},
    },
  };
}

function readFeaturesJson(pathToUserProjectRoot: string): FeaturesJson {
  const pathToFeaturesJson = upath.join(
    pathToUserProjectRoot,
    "sites-config/features.json"
  );
  const jsonString = fs.readFileSync(pathToFeaturesJson, "utf-8");
  return JSON.parse(jsonString);
}

function regenerateTestData(
  stream: Stream,
  entityFeature: EntityFeature,
  featuresJson: FeaturesJson
) {
  featuresJson.streams.push(stream);
  featuresJson.features.push(entityFeature);
  return generateTestData(featuresJson);
}

/**
 * Spawns a `yext pages generate-test-data -a` call with the given FeaturesJson.
 */
function generateTestData(featuresJson: FeaturesJson) {
  const stringifiedFeaturesJson = `'${JSON.stringify(featuresJson)}'`;
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
    return "Could not generate test data, but page was still created.";
  }
  return "Successfully regenerated test data.";
}

interface FeaturesJson {
  features: Feature[];
  streams: Stream[];
}

type Feature = EntityFeature | StaticFeature;
interface EntityFeature extends FeatureBase {
  entityPageSet: {
    plugin: Record<string, never>;
  };
}
interface StaticFeature extends FeatureBase {
  staticPage: {
    urlTemplate?: string;
    htmlTemplate?: string;
  };
}
interface FeatureBase {
  name: string;
  streamId?: string;
  templateType: "JS";
  alternateLanguageFields?: string[];
}
