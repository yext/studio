import { StudioData } from "@yext/studio-plugin";
import path from "path";

const mockFilepath = path.join(__dirname, "../tests/__mocks__");
const mockStudioData: StudioData = {
  pageNameToPageState: {},
  pageNameToErrorPageState: {},
  layoutNameToLayoutMetadata: {},
  UUIDToFileMetadata: {},
  studioConfig: {
    openBrowser: true,
    paths: {
      components: mockFilepath,
      pages: mockFilepath,
      layouts: mockFilepath,
      siteSettings: mockFilepath,
      localData: mockFilepath,
    },
    isPagesJSRepo: false,
    port: 8080,
  },
  isWithinCBD: false,
};
export default mockStudioData;
