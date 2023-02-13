import { HexColor } from "@yext/studio";

export interface SiteSettings {
  someNum: number;
  experienceKey: string;
  optionalString?: string;
  "Global Colors": {
    primary: HexColor;
  };
}

export default {
  someNum: 12,
  experienceKey: "slanswers",
  "Global Colors": {
    primary: "#AABBCC",
  },
};
