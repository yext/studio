import ComponentTree from "./components/ComponentTree";
import EditorPanel from "./components/EditorPanel";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const activeComponentState = useStudioStore((store) =>
    store.pages.getActiveComponentState()
  );

  return (
    <div className="App">
      <div className="flex flex-row w-screen h-screen">
        <ComponentTree />
        <div className="grow w-1/3 bg-gray-300">
          <div>Preview</div>
          <div>activeComponentState: {JSON.stringify(activeComponentState, null, 2)}</div>
        </div>
        <EditorPanel />
      </div>
    </div>
  );
}
