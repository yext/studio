// import { useStudioStore } from './store/store';
import { ComponentStateKind } from '@yext/studio-plugin';

export default function App() {
  console.log(ComponentStateKind)
  // const state = useStudioStore(store => store)
  // console.log(state)
  return (
    <div className="App bg-sky-400">
      <h1>Studio Client</h1>
      <h2>Active Page: {activePageName}</h2>
      <div>Active PageState: {JSON.stringify(activePageState, null, 2)}</div>
    </div>
  );
}
