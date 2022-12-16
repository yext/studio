import { useStudioStore } from './store/store';
import { ComponentStateKind } from '@yext/studio-plugin';

export default function App() {
  console.log(ComponentStateKind)
  const state = useStudioStore(store => store)
  console.log('studio store', state)
  return (
    <div className="App">
      <h1>Studio Client</h1>
    </div>
  );
}
