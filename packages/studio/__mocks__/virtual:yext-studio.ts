import { StudioData } from "@yext/studio-plugin";
import path from "path";

const mockFilepath = path.join(__dirname, "../tests/__mocks__");
const mockStudioData: StudioData = {
  pageNameToPageState: {},
  pageNameToErrorPageState: {},
  UUIDToFileMetadata: {},
  studioConfig: {
    paths: {
      components: mockFilepath,
      pages: mockFilepath,
      modules: mockFilepath,
      siteSettings: mockFilepath,
      localData: mockFilepath,
    },
    isPagesJSRepo: false,
    port: 8080,
  },
};
export default mockStudioData;
