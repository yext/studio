import { StudioData } from "@yext/studio-plugin";
import path from "path";

const mockFilepath = path.join(__dirname, "../tests/__mocks__")
const mockStudioData: StudioData = {
  pageNameToPageState: {},
  UUIDToFileMetadata: {},
  studioPaths: {
    components: mockFilepath,
    pages: mockFilepath,
    modules: mockFilepath,
    siteSettings: mockFilepath,
    localData: mockFilepath
  }
};
export default mockStudioData;
