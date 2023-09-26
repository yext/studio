import { lazy, Suspense } from 'react';
import LoadingOverlay from './components/LoadingOverlay';

const RawApp = lazy(() => import('./App'));

export default function App() {
  return (
    <LoadingOverlay>
      <Suspense fallback={<LoadingOverlay>Waiting on Bundle</LoadingOverlay>}>
        <RawApp/>
      </Suspense>
    </LoadingOverlay>
  )
}
