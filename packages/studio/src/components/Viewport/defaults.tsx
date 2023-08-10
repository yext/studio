export interface Viewport {
    name: string;
    styles: ViewportStyles | null;
    type: 'desktop' | 'mobile' | 'tablet' | 'other';
}

export interface ViewportStyles {
    height: string;
    width: string;
}

export interface ViewportMap {
    [key: string]: Viewport;
}

export const INITIAL_VIEWPORTS: ViewportMap = {
  iphonex: {
    name: 'iPhone X',
    styles: {
      height: '812px',
      width: '375px',
    },
    type: 'mobile',
  },
  iphonexr: {
    name: 'iPhone XR',
    styles: {
      height: '896px',
      width: '414px',
    },
    type: 'mobile',
  },
  iphonexsmax: {
    name: 'iPhone XS Max',
    styles: {
      height: '896px',
      width: '414px',
    },
    type: 'mobile',
  },
  iphonese2: {
    name: 'iPhone SE (2nd generation)',
    styles: {
      height: '667px',
      width: '375px',
    },
    type: 'mobile',
  },
  iphone12mini: {
    name: 'iPhone 12 mini',
    styles: {
      height: '812px',
      width: '375px',
    },
    type: 'mobile',
  },
  iphone12: {
    name: 'iPhone 12',
    styles: {
      height: '844px',
      width: '390px',
    },
    type: 'mobile',
  },
  iphone12promax: {
    name: 'iPhone 12 Pro Max',
    styles: {
      height: '926px',
      width: '428px',
    },
    type: 'mobile',
  },
  galaxys5: {
    name: 'Galaxy S5',
    styles: {
      height: '640px',
      width: '360px',
    },
    type: 'mobile',
  },
  galaxys9: {
    name: 'Galaxy S9',
    styles: {
      height: '740px',
      width: '360px',
    },
    type: 'mobile',
  },
  nexus5x: {
    name: 'Nexus 5X',
    styles: {
      height: '660px',
      width: '412px',
    },
    type: 'mobile',
  },
  nexus6p: {
    name: 'Nexus 6P',
    styles: {
      height: '732px',
      width: '412px',
    },
    type: 'mobile',
  },
  pixel: {
    name: 'Pixel',
    styles: {
      height: '960px',
      width: '540px',
    },
    type: 'mobile',
  },
  pixelxl: {
    name: 'Pixel XL',
    styles: {
      height: '1280px',
      width: '720px',
    },
    type: 'mobile',
  },
};
export const DEFAULT_VIEWPORT = 'responsive';

export const MINIMAL_VIEWPORTS: ViewportMap = {
  mobile1: {
    name: 'Small mobile',
    styles: {
      height: '568px',
      width: '320px',
    },
    type: 'mobile',
  },
  mobile2: {
    name: 'Large mobile',
    styles: {
      height: '896px',
      width: '414px',
    },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet',
    styles: {
      height: '1112px',
      width: '834px',
    },
    type: 'tablet',
  },
};