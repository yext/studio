import { PropMetadata } from "./PropShape";
import { LiteralProp, ObjectProp, PropValues } from "./PropValues";

export interface SiteSettings {
  shape: SiteSettingsShape;
  values: SiteSettingsValues;
}

export type SiteSettingsShape = {
  [key: string]: PropMetadata;
};

export type SiteSettingsValues = {
  [propName: string]: LiteralProp<SiteSettingsValues>;
};
