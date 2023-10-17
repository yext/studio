import { RefObject, useEffect, useState } from "react";
import { Viewport } from "../components/Viewport/defaults";

export default function useViewportOption (
  viewport: Viewport,
  previewRef: RefObject<HTMLDivElement>
) {
  const [css, setCss] = useState(
    (viewport.styles?.width ?? 0) * (previewRef.current?.clientHeight ?? 0) >
      (viewport.styles?.height ?? 0) * (previewRef.current?.clientWidth ?? 0)
      ? " w-full "
      : " h-full "
  );
  const handleResize = () => {
    const tempCss =
      (viewport.styles?.width ?? 0) * (previewRef.current?.clientHeight ?? 0) >
      (viewport.styles?.height ?? 0) * (previewRef.current?.clientWidth ?? 0)
        ? " w-full "
        : " h-full ";
    if (tempCss !== css) {
      setCss(tempCss);
    }
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    if (previewRef.current) {
      resizeObserver.observe(previewRef.current);
    }
    return () => resizeObserver.disconnect();
  });

  return css;
};
