import { PropMetadata } from "./PropShape.js";
import { LiteralProp, PropValueType } from "./PropValues.js";

export interface SiteSettings {
  shape: SiteSettingsShape;
  values: SiteSettingsValues;
}

export type SiteSettingsShape = {
  [key: string]: PropMetadata<SiteSettingsPropValueType>;
};

export type SiteSettingsPropValueType = Exclude<
  PropValueType,
  PropValueType.ReactNode | PropValueType.Record | PropValueType.Array
>;

export type SiteSettingsValues = {
  [propName: string]: LiteralProp<SiteSettingsValues>;
};
