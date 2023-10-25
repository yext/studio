export interface Viewport {
  name: string;
  styles: { height: number; width: number } | null;
  type: "desktop" | "mobile" | "tablet" | "other";
  css: string;
}

export interface ViewportStyles {
  name: string;
  height: number;
  width: number;
}

export interface ViewportMap {
  [key: string]: Viewport;
}

export const VIEWPORTS: ViewportMap = {
  resetviewport: {
    name: "Reset Viewport",
    styles: null,
    type: "other",
    css: "h-full w-full",
  },
  iphonese: {
    name: "iPhone SE",
    styles: {
      height: 667,
      width: 375,
    },
    type: "mobile",
    css: "w-[375px] h-[667px]",
  },
  iphone14: {
    name: "iPhone 14",
    styles: {
      height: 844,
      width: 390,
    },
    type: "mobile",
    css: "w-[390px] h-[844px]",
  },
  galaxyzflip5folded: {
    name: "Galaxy Z Flip5 Folded",
    styles: {
      height: 748,
      width: 720,
    },
    type: "mobile",
    css: "w-[720px] h-[748px]",
  },
  galaxyzflip5unfolded: {
    name: "Galaxy Z Flip5 Unfolded",
    styles: {
      height: 1760,
      width: 720,
    },
    type: "mobile",
    css: "w-[720px] h-[1760px]",
  },
  pixel7: {
    name: "Pixel 7",
    styles: {
      height: 800,
      width: 360,
    },
    type: "mobile",
    css: "w-[360px] h-[800px]",
  },
  pixelfoldfolded: {
    name: "Pixel Fold Folded",
    styles: {
      height: 720,
      width: 372,
    },
    type: "mobile",
    css: "w-[372px] h-[720px]",
  },
  pixelfoldunfolded: {
    name: "Pixel Fold Unfolded",
    styles: {
      height: 720,
      width: 600,
    },
    type: "mobile",
    css: "w-[600px] h-[720px]",
  },
};
