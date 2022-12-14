import { useStudioStore } from './store/store';

export default function App() {
  const state = useStudioStore(store => state)
  console.log(state)
  return (
    <div className="App">
      <h1>Studio Client</h1>
    </div>
  );
}
