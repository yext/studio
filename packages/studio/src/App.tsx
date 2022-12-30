import EditorPanel from "./components/EditorPanel";
import ActivePagePanel from "./components/ActivePagePanel";
import useStudioStore from "./store/useStudioStore";
import ActionsBar from "./components/ActionsBar";

export default function App() {
  const activeComponentState = useStudioStore((store) =>
    store.pages.getActiveComponentState()
  );

  return (
    <div className="App">
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-gray-300">
            <div>Preview</div>
            <div>activeComponentState: {JSON.stringify(activeComponentState, null, 2)}</div>
          </div>
          <EditorPanel />
        </div>
      </div>
    </div>
  );
}
