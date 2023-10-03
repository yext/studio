import { createPortal } from "react-dom";
import {
  Dispatch,
  PropsWithChildren,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import useStudioStore from "../store/useStudioStore";
import { twMerge } from "tailwind-merge";
import { Viewport } from "./Viewport/defaults";
import dynamicImportFromBrowser from "../utils/dynamicImportFromBrowser";

export default function IFramePortal(
  props: PropsWithChildren<{
    title: string;
    iframeEl: HTMLIFrameElement | null;
    setIframeEl: Dispatch<SetStateAction<HTMLIFrameElement | null>>;
  }>
) {
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeDocument = props.iframeEl?.contentWindow?.document;
  const [viewport] = useStudioStore((store) => [store.pagePreview.viewport]);
  useParentDocumentStyles(iframeDocument);
  const iframeCSS = twMerge(
    "mr-auto ml-auto border-2",
    viewport.css,
    useViewportOption(viewport, previewRef)
  );

  return (
    <div ref={previewRef} className="grow w-1/3 bg-white border-8 shadow">
      <iframe
        id="iframe"
        title={props.title}
        ref={props.setIframeEl}
        className={iframeCSS}
      ></iframe>
      {iframeDocument && createPortal(props.children, iframeDocument.body)}
    </div>
  );
}

function useParentDocumentStyles(iframeDocument: Document | undefined) {
  const [
    activePage,
    fileMetadatas,
    componentTree,
    importedComponents,
    cssStyling,
  ] = useStudioStore((studio) => [
    studio.pages.activePageName,
    studio.fileMetadatas.UUIDToFileMetadata,
    studio.pages.getActivePageState()?.componentTree,
    studio.fileMetadatas.UUIDToImportedComponent,
    studio.cssStyling.importerToCssMap,
  ]);

  const injectTailwindDirectives = useCallback(() => {
    const inlineStyles = document.head.getElementsByTagName("style");
    for (const el of inlineStyles) {
      const filepath = el.getAttribute("data-vite-dev-id");
      if (!filepath) {
        continue;
      }
      const isTailwindDirective = getIsTailwindDirective(filepath);
      if (!isTailwindDirective) {
        continue;
      }
      const cloneNode: Node = el.cloneNode(true);
      iframeDocument?.head.appendChild(cloneNode);
    }
  }, [iframeDocument]);

  useEffect(() => {
    if (!iframeDocument) {
      return;
    }
    componentTree?.forEach((componentState) => {
      if (!componentState.metadataUUID) {
        return;
      }
      const filename = fileMetadatas[componentState.metadataUUID].filepath;
      if (!cssStyling.hasOwnProperty(filename)) {
        return;
      }
      cssStyling[filename].forEach((cssFilepath) => {
        return dynamicImport(`${cssFilepath}?inline`).then((response) => {
          const styleTag: HTMLStyleElement = document.createElement("style");
          iframeDocument.head.appendChild(styleTag);
          styleTag.innerText = response;
        });
      });
    });

    injectTailwindDirectives();
    return () => {
      const styleElements = Array.prototype.slice.call(
        iframeDocument.head.getElementsByTagName("style")
      );
      for (const el of styleElements) {
        el.remove();
      }
    };
  }, [
    iframeDocument,
    activePage,
    fileMetadatas,
    componentTree,
    importedComponents,
    cssStyling,
    injectTailwindDirectives,
  ]);
}

function getIsTailwindDirective(filepath: string) {
  const isTailwindDirectiveRE = /\/tailwind-directives.css/;
  return !!filepath.match(isTailwindDirectiveRE);
}

async function dynamicImport(filepath: string) {
  const contents = (await dynamicImportFromBrowser(filepath + "?studioStyling"))
    .default;
  return contents;
}

const useViewportOption = (
  viewport: Viewport,
  previewRef: RefObject<HTMLDivElement>
) => {
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
