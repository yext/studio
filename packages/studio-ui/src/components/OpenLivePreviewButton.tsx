import { PageState, PagesJsState } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import classNames from "classnames";
import { Result } from "true-myth";
import { useCallback } from "react";

// The URL of the Landing Page of the PagesJS Dev Server. Port 5173 is hardcoded for now as it will be the PagesJS Dev port in most cases.
export const PAGES_JS_LANDING_PAGE = "http://localhost:5173";

/**
 * The button rendered by this Component opens a PagesJS-powered Preview of the current Page in a new tab.
 * If the Page is an Entity Template, the Preview will use the currently selected Entity Data.
 */
export default function OpenLivePreviewButton(): JSX.Element {
  const [activePageName, activePageState, activeEntityData] = useStudioStore(
    (store) => [
      store.pages.activePageName as string,
      store.pages.getActivePageState(),
      store.pages.getActiveEntityData(),
    ]
  );

  const livePreviewUrlResult = getLivePreviewUrl(
    activePageState,
    activePageName,
    activeEntityData
  );

  const onClick = useCallback(() => {
    livePreviewUrlResult.map((url) => window.open(url, "_blank"));
  }, [livePreviewUrlResult]);

  const buttonClasses = classNames(
    "rounded-md px-2 py-1 flex items-center gap-x-2 text-white",
    {
      "bg-gray-400": livePreviewUrlResult.isErr,
      "bg-blue-600 shadow-md hover:bg-blue-700 hover:shadow-lg":
        livePreviewUrlResult.isOk,
    }
  );

  return (
    <div className="relative inline-block">
      <button
        className={buttonClasses}
        disabled={livePreviewUrlResult.isErr}
        onClick={onClick}
      >
        Live Preview
      </button>
    </div>
  );
}

function getLivePreviewUrl(
  activePageState: PageState | undefined,
  pageName: string,
  entityData?: Record<string, unknown>
): Result<string, Error> {
  const isActivePagesJSPage = !!activePageState?.pagesJS;

  if (isActivePagesJSPage) {
    const pagesJSState = activePageState.pagesJS as PagesJsState;
    const isEntityPage = !!pagesJSState.streamScope;
    if (isEntityPage) {
      return entityData?.id
        ? Result.ok(`${PAGES_JS_LANDING_PAGE}/${pageName}/${entityData.id}`)
        : Result.err(new Error("Cannot create Preview URL for Entity Page"));
    }

    const getPathVal = pagesJSState.getPathValue;
    return !!getPathVal
      ? Result.ok(`${PAGES_JS_LANDING_PAGE}/${getPathVal.value}`)
      : Result.err(new Error("Cannot create Preview URL for Static Page"));
  } else {
    return Result.err(new Error("There is no active PagesJS Template"));
  }
}
