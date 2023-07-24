import { TemplateConfig, Stream } from "@yext/pages/*";

export default function registerTestData(newTemplateConfig: TemplateConfig) {
  const preexistingFeaturesJson = readFeaturesJson();
  if (newTemplateConfig.stream) {
    preexistingFeaturesJson.streams.push(newTemplateConfig.stream);
  }
  const newFeature = getFeature("UniversalPage", newTemplateConfig); 
  preexistingFeaturesJson.features.push(newFeature);
  generateTestData(preexistingFeaturesJson);
}

function readFeaturesJson(): FeaturesJson {
  return {} as FeaturesJson;
}


function generateTestData(featuresJson: FeaturesJson) {
  // yext pages generate-test-data -a --featuresConfig { blah blah blah }
  console.log(featuresJson);
  const stringifiedFeatureJson = prepareJsonForCmd(featuresJson);
  // spawn a yext pages generate-test-data
}

// Honestly I think I'd prefer to write to a temp features.json than do this lol
// but that doesn't seem to be an option?
const prepareJsonForCmd = (json: any) => {
  let jsonString;
  // test that this is necessary
  if (process.platform === "win32") {
    jsonString = `${JSON.stringify(json).replace(/([\\]*)"/g, `$1$1\\"`)}`;
  } else {
    jsonString = `'${JSON.stringify(json)}'`;
  }
  return jsonString;
};

interface FeaturesConfig {
  features: Feature[],
  streams: Stream[]
}

interface FeatureBase {
  name: string;
  streamId?: string;
  templateType: "JS";
  alternateLanguageFields?: string[];
}

interface EntityFeature extends FeatureBase {
  entityPageSet: {
    urlTemplate?: string;
    htmlTemplate?: string;
    linkedEntities?: { entityListField: string; templateField: string }[];
  };
}
interface StaticFeature extends FeatureBase {
  staticPage: {
    urlTemplate?: string;
    htmlTemplate?: string;
  };
}

type Feature = EntityFeature | StaticFeature

/**
 * Converts a {@link TemplateConfigInternal} into a valid single {@link FeatureConfig}.
 */
function getFeature(
  pageName: string,
  config: TemplateConfig
): Feature {
  const streamConfig = config.stream || null;

  const featureBase: FeatureBase = {
    name: pageName,
    streamId: streamConfig?.$id ?? config.streamId,
    templateType: "JS",
    alternateLanguageFields: config.alternateLanguageFields,
  };

  const isEntityPageTemplate = !!config.stream?.$id;
  if (isEntityPageTemplate) {
    return {
      ...featureBase,
      entityPageSet: {},
    };
  } else {
    return {
      ...featureBase,
      staticPage: {},
    };
  }
};
