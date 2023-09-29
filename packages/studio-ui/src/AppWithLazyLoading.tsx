import LoadingOverlay from "./components/LoadingOverlay";
import { Suspense, lazy, useEffect, useState } from "react";
import useStudioStore from "./store/useStudioStore";
import ProgressBar from "./components/ProgressBar";
import loadComponents from "./utils/loadComponents";
import classNames from "classnames";

const AppPromise = import("./App");
const App = lazy(() => AppPromise);

export default function AppWithLazyLoading() {
  const [importedComponents, totalCount] = useStudioStore((store) => [
    Object.keys(store.fileMetadatas.UUIDToImportedComponent),
    Object.keys(store.fileMetadatas.UUIDToFileMetadata).length,
  ]);

  const loadedCount = importedComponents.length
  const componentsLoaded = loadedCount === totalCount;
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    loadComponents();
    void AppPromise.then(() => setAppLoaded(true));
  }, []);

  useEffect(() =>{
    const inlineStyles = document.head.getElementsByTagName("style");
    for (const el of inlineStyles) {
      const filepath = el.getAttribute("data-vite-dev-id");
      if (!filepath) {
        continue;
      }
      const componentUUID = getUUIDQueryParam(filepath);
      if (componentUUID && importedComponents.includes(componentUUID)) {
        el.disabled = true;
      }
    }
  }, [importedComponents])

  return (
    <LoadingOverlay
      loading={!componentsLoaded || !appLoaded}
      overlay={
        <>
          {renderComponentLoadingProgress(
            loadedCount,
            totalCount,
            componentsLoaded
          )}
          {renderBundleMessage(appLoaded)}
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

function renderBundleMessage(appLoaded: boolean) {
  const className = classNames("text-sky-600 mt-4", {
    "animate-pulse": !appLoaded,
  });
  const msg = appLoaded
    ? "Studio resources loaded!"
    : "... loading Studio resources ...";

  return <div className={className}>{msg}</div>;
}

function getUUIDQueryParam(filepath: string) {
  const getComponentNameRE = /(?<=\?.*studioComponentUUID=)[a-zA-Z0-9-]*/;
  const componentNameResult = filepath.match(getComponentNameRE);
  return componentNameResult ? String(componentNameResult) : undefined;
}
