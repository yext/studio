import { Viewport } from "../../../components/Viewport/defaults";

export default interface PagePreviewSlice {
  viewport: Viewport;
  setViewport: (viewport: Viewport) => void;
}
