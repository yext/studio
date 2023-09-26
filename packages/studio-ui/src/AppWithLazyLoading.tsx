import LoadingOverlay from './components/LoadingOverlay';
import { Suspense, lazy, useEffect, useState } from "react";
import useStudioStore from './store/useStudioStore';
import ProgressBar from './components/ProgressBar';
import loadComponents from './utils/loadComponents';

const AppPromise = import('./App')
const App = lazy(() => AppPromise);

export default function AppWithLazyLoading() {
  const [loadedCount, totalCount] = useStudioStore(store => [
    Object.keys(store.fileMetadatas.UUIDToImportedComponent).length,
    Object.keys(store.fileMetadatas.UUIDToFileMetadata).length,
  ]);
  const componentsLoaded = loadedCount === totalCount;
  const [ appLoaded, setAppLoaded ] = useState(false);

  useEffect(() => {
    loadComponents();
    void AppPromise.then(() => setAppLoaded(true))
  }, []);

  return (
    <LoadingOverlay loading={!componentsLoaded || !appLoaded} overlay={
      <>
        <ProgressBar progressFraction={loadedCount/totalCount}/>
        <div className='text-indigo-800 animate-pulse'>
          {componentsLoaded ? <span>components loaded!</span> : <span>loading components... ({loadedCount}/{totalCount})</span>}
        </div>
        <div className='animate-pulse text-sky-600'>
          {appLoaded ? <span>JS bundle loaded!</span> : <span>... loading JS bundle ...</span>}
        </div>
      </>
    }>
      <Suspense>
        <App/>
      </Suspense>
    </LoadingOverlay>
  )
}