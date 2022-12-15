import { PropShape, PropValues } from "../types";
import PropShapeParser from "./PropShapeParser";
import PropValuesParser from "./PropValuesParser";
import StudioSourceFile from "./StudioSourceFile";

export interface SiteSettings {
  shape: PropShape;
  values: PropValues;
}

export default class SiteSettingsFile {
  private studioSourceFile: StudioSourceFile;
  private propShapeParser: PropShapeParser;
  private propValuesParser: PropValuesParser;

  constructor(filepath: string) {
    this.studioSourceFile = new StudioSourceFile(filepath);
    this.propValuesParser = new PropValuesParser(this.studioSourceFile);
    this.propShapeParser = new PropShapeParser(this.studioSourceFile);
  }

  getSiteSettings(): SiteSettings {
    const siteSettingsShape: PropShape =
      this.propShapeParser.parsePropShape("SiteSettings");
    const values = this.propValuesParser.parsePropValues(siteSettingsShape);
    if (!values) {
      throw new Error("No default export found for site settings");
    }
    return {
      shape: siteSettingsShape,
      values,
    };
  }
}
