import { PropMetadata } from "./PropShape";
import { LiteralProp, PropValueType } from "./PropValues";

export interface SiteSettings {
  shape: SiteSettingsShape;
  values: SiteSettingsValues;
}

export type SiteSettingsShape = {
  [key: string]: PropMetadata<SiteSettingsPropValueType>;
};

export type SiteSettingsPropValueType = Exclude<
  PropValueType,
  PropValueType.ReactNode | PropValueType.Record
>;

export type SiteSettingsValues = {
  [propName: string]: LiteralProp<SiteSettingsValues>;
};
