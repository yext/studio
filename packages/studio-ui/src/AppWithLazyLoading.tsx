import LoadingOverlay from "./components/LoadingOverlay";
import { Suspense, lazy, useEffect, useState } from "react";
import useStudioStore from "./store/useStudioStore";
import ProgressBar from "./components/ProgressBar";
import { loadComponents, loadStyling } from "./utils/loadUserAssets";
import classNames from "classnames";

const AppPromise = import("./App");
const App = lazy(() => AppPromise);

export default function AppWithLazyLoading() {
  const [loadedCount, totalCount] = useStudioStore((store) => [
    Object.keys(store.fileMetadatas.UUIDToImportedComponent).length,
    Object.keys(store.fileMetadatas.UUIDToFileMetadata).length,
  ]);
  const componentsLoaded = loadedCount === totalCount;
  const [appLoaded, setAppLoaded] = useState(false);
  const [stylesLoaded, setStylesLoaded] = useState(false);
  const resourcesLoaded = appLoaded && stylesLoaded;

  useEffect(() => {
    loadComponents();
    void Promise.all(loadStyling()).then(() => setStylesLoaded(true));
    void AppPromise.then(() => setAppLoaded(true));
  }, []);

  return (
    <LoadingOverlay
      loading={!(componentsLoaded && stylesLoaded && appLoaded)}
      overlay={
        <>
          {renderComponentLoadingProgress(
            loadedCount,
            totalCount,
            componentsLoaded
          )}
          {renderResourcesLoadingMessage(resourcesLoaded)}
        </>
      }
    >
      <Suspense>
        <App />
      </Suspense>
    </LoadingOverlay>
  );
}

function renderComponentLoadingProgress(
  loadedCount: number,
  totalCount: number,
  componentsLoaded: boolean
) {
  const msg = componentsLoaded
    ? "components loaded!"
    : `loading components... (${loadedCount}/${totalCount})`;

  return (
    <>
      <ProgressBar progressFraction={loadedCount / totalCount} />
      <div
        className={classNames("text-indigo-800", {
          "animate-pulse": !componentsLoaded,
        })}
      >
        {msg}
      </div>
    </>
  );
}

function renderResourcesLoadingMessage(loadComplete: boolean) {
  const className = classNames("text-sky-600 mt-4", {
    "animate-pulse": !loadComplete,
  });
  const msg = loadComplete
    ? "Studio resources loaded!"
    : "... loading Studio resources ...";

  return <div className={className}>{msg}</div>;
}
