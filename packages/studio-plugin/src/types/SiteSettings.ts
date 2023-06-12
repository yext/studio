import { PropMetadata } from "./PropShape";
import { ArrayProp, LiteralProp, PropValueType } from "./PropValues";

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
  [propName: string]: SiteSettingsVal;
};

export type SiteSettingsVal = Exclude<
  LiteralProp<SiteSettingsValues>,
  ArrayProp
>;
