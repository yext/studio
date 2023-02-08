import { HexColor } from "@yext/studio";

export interface SiteSettings {
  experienceKey: string;
  "Global Colors": {
    primary: HexColor;
  };
}

export default {
  experienceKey: "slanswers",
  "Global Colors": {
    primary: "#FFBBFF",
  },
};
