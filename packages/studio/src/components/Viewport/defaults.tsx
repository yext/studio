export interface Viewport {
  name: string;
  styles: { height: number; width: number } | null;
  type: "desktop" | "mobile" | "tablet" | "other";
}

export interface ViewportStyles {
  name: string;
  height: number;
  width: number;
}

export interface ViewportMap {
  [key: string]: Viewport;
}

//todo add more "new" phones + dimensions
export const INITIAL_VIEWPORTS: ViewportMap = {
  iphonex: {
    name: "iPhone X",
    styles: {
      height: 812,
      width: 375,
    },
    type: "mobile",
  },
  iphonexr: {
    name: "iPhone XR",
    styles: {
      height: 896,
      width: 414,
    },
    type: "mobile",
  },
  iphonexsmax: {
    name: "iPhone XS Max",
    styles: {
      height: 896,
      width: 414,
    },
    type: "mobile",
  },
  iphonese2: {
    name: "iPhone SE (2nd generation)",
    styles: {
      height: 667,
      width: 375,
    },
    type: "mobile",
  },
  iphone12mini: {
    name: "iPhone 12 mini",
    styles: {
      height: 812,
      width: 375,
    },
    type: "mobile",
  },
  iphone12: {
    name: "iPhone 12",
    styles: {
      height: 844,
      width: 390,
    },
    type: "mobile",
  },
  iphone12promax: {
    name: "iPhone 12 Pro Max",
    styles: {
      height: 926,
      width: 428,
    },
    type: "mobile",
  },
  galaxys5: {
    name: "Galaxy S5",
    styles: {
      height: 640,
      width: 360,
    },
    type: "mobile",
  },
  galaxys9: {
    name: "Galaxy S9",
    styles: {
      height: 740,
      width: 360,
    },
    type: "mobile",
  },
  nexus5x: {
    name: "Nexus 5X",
    styles: {
      height: 660,
      width: 412,
    },
    type: "mobile",
  },
  nexus6p: {
    name: "Nexus 6P",
    styles: {
      height: 732,
      width: 412,
    },
    type: "mobile",
  },
  pixel: {
    name: "Pixel",
    styles: {
      height: 960,
      width: 540,
    },
    type: "mobile",
  },
  pixelxl: {
    name: "Pixel XL",
    styles: {
      height: 1280,
      width: 720,
    },
    type: "mobile",
  },
};
export const DEFAULT_VIEWPORT = "responsive"; // todo tbd if we need this

export const MINIMAL_VIEWPORTS: ViewportMap = {
  mobile1: {
    name: "Small Mobile",
    styles: {
      height: 568,
      width: 320,
    },
    type: "mobile",
  },
  mobile2: {
    name: "Large Mobile",
    styles: {
      height: 896,
      width: 414,
    },
    type: "mobile",
  },
  tablet: {
    name: "Tablet",
    styles: {
      height: 1112,
      width: 834,
    },
    type: "tablet",
  },
};

export const MINIMAL_VIEWPORTS_CSS = {
  LargeMobile: "aspect-[320/568]",
  SmallMobile: "aspect-[414/896]",
  Tablet: "aspect-[834/1112]",
  ResetViewport: "w-full h-full",
};
