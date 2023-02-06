import { HexColor } from "@yext/studio";

export interface SiteSettings {
  experienceKey: string;
  optionalString?: string;
  "Global Colors": {
    primary: HexColor;
  };
}

export default {
  experienceKey: "!!!",
  "Global Colors": {
    primary: "#AAAAFF",
  },
};
