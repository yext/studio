import { searchUiReactStudioPlugin } from "search-ui-react-plugin";
import { StudioConfig } from "../studio";

const studioConfig: StudioConfig = {
  plugins: [searchUiReactStudioPlugin],
  dirs: {
    pagesDir: './src/templates'   
  }
}
export default studioConfig