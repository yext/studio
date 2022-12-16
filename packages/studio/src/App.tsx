import ComponentTree from "./components/ComponentTree";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  console.log(ComponentStateKind);
  const state = useStudioStore((store) => store);
  console.log("studio store", state);
  return (
    <div className="App bg-sky-400">
      <h1>Studio Client</h1>
      <h2>Active Page: {activePageName}</h2>
      <div>Active PageState: {JSON.stringify(activePageState, null, 2)}</div>
      <ComponentTree />
    </div>
  );
}
