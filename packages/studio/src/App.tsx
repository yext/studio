import EditorPanel from "./components/EditorPanel";
import ComponentTreePreview from "./components/ComponentTreePreview";
import ActivePagePanel from "./components/ActivePagePanel";
import useStudioStore from "./store/useStudioStore";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";

export default function App() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-gray-300">
            {componentTree && (
              <ComponentTreePreview componentTree={componentTree} />
            )}
          </div>
          <EditorPanel />
        </div>
      </div>
    </div>
  );
}
