import { Project } from "ts-morph";
import { PropShape, PropValues } from "../types";
import PropShapeParser from "../parsers/PropShapeParser";
import PropValuesParser from "../parsers/PropValuesParser";
import StudioSourceFileParser from "../parsers/StudioSourceFileParser";

export interface SiteSettings {
  shape: PropShape;
  values: PropValues;
}

export default class SiteSettingsFile {
  private studioSourceFileParser: StudioSourceFileParser;
  private propShapeParser: PropShapeParser;
  private propValuesParser: PropValuesParser;

  constructor(filepath: string, project: Project) {
    this.studioSourceFileParser = new StudioSourceFileParser(filepath, project);
    this.propValuesParser = new PropValuesParser(this.studioSourceFileParser);
    this.propShapeParser = new PropShapeParser(this.studioSourceFileParser);
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
