import EditorSidebar from "./components/EditorSidebar";
import ActivePagePanel from "./components/ActivePagePanel";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import HighlightedPreview from "./components/HighlightedPreview";
import useImportedComponents from "./hooks/useImportedComponents";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  void useImportedComponents(componentTree);

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-white border-8 shadow">
            <HighlightedPreview />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
