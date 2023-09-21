import { PageState, PagesJsState } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import classNames from "classnames";
import { Result } from "true-myth";
import { useCallback } from "react";

//
export const PAGES_JS_LANDING_PAGE = "http://localhost:5173";

/**
 * OpenLivePreviewButton is a button that when clicked, opens the
 * pages development server index page in a new tab.
 * Port 5173 hardcoded for now as it will be the pages dev port in most cases
 */
export default function OpenLivePreviewButton(): JSX.Element {
  let previewDisabled;
  let livePreviewUrl;

  const [activePageName, activePageState, activeEntityData] = useStudioStore(
    (store) => [
      store.pages.activePageName as string,
      store.pages.getActivePageState() as PageState,
      store.pages.getActiveEntityData(),
    ]
  );

  const isPagesJSPage = !!activePageState.pagesJS;
  if (isPagesJSPage) {
    const pagesJSState = activePageState.pagesJS as PagesJsState;
    const livePreviewUrlResult = getLivePreviewUrl(
      pagesJSState,
      activePageName,
      activeEntityData
    );
    previewDisabled = livePreviewUrlResult.isErr;
    livePreviewUrl = livePreviewUrlResult.isOk && livePreviewUrlResult.value;
  } else {
    previewDisabled = true;
  }

  const onClick = useCallback(() => {
    livePreviewUrl && window.open(livePreviewUrl, "_blank");
  }, [livePreviewUrl]);
  const buttonClasses = classNames(
    "rounded-md px-2 py-1 flex items-center gap-x-2 text-white",
    {
      "bg-gray-400": previewDisabled,
      "bg-blue-600 shadow-md hover:bg-blue-700 hover:shadow-lg":
        !previewDisabled,
    }
  );

  return (
    <div className="relative inline-block">
      <button
        className={buttonClasses}
        disabled={previewDisabled}
        onClick={onClick}
      >
        Live Preview
      </button>
    </div>
  );
}

function getLivePreviewUrl(
  pagesJSState: PagesJsState,
  pageName: string,
  entityData?: Record<string, unknown>
): Result<string, Error> {
  const isEntityPage = !!pagesJSState.streamScope;
  if (isEntityPage) {
    return entityData?.id
      ? Result.ok(`${PAGES_JS_LANDING_PAGE}/${pageName}/${entityData.id}`)
      : Result.err(new Error("Bad"));
  }

  const getPathVal = pagesJSState.getPathValue;
  return !!getPathVal
    ? Result.ok(`${PAGES_JS_LANDING_PAGE}/${getPathVal.value}`)
    : Result.err(new Error("Bad"));
}
