import ComponentTree from "./components/ComponentTree";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const activeComponentState = useStudioStore((store) =>
    store.pages.getActiveComponentState()
  );

  return (
    <div className="App bg-sky-400">
      activeComponentState: {JSON.stringify(activeComponentState)}
      <ComponentTree />
    </div>
  );
}
