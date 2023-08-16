import { ViewportStyles } from "../../../components/Viewport/defaults";

export default interface PagePreviewSlice {
  viewportDimensions: ViewportStyles;
  setViewportDimensions: (viewportDimensions: ViewportStyles) => void;
}
