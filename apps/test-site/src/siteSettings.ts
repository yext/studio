import { HexColor } from "@yext/studio";

export interface SiteSettings {
  someText: string;
  experienceKey: string;
  optionalString?: string;
  "Global Colors": {
    primary: HexColor;
  };
}

export default {
  someText: "name",
  experienceKey: "slanswers",
  "Global Colors": {
    primary: "#AABBCC",
  },
};
