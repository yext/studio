import { Stream } from "@yext/pages";

export interface FeaturesJson {
  streams: Stream[];
  features: Feature[];
}

type Feature = EntityFeature | StaticFeature;

export interface EntityFeature extends FeatureBase {
  entityPageSet: Record<string, never>;
}

export interface StaticFeature extends FeatureBase {
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
