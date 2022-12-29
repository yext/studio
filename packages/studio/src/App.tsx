import EditorPanel from "./components/EditorPanel";
import PagePreview from "./components/PagePreview";
import ActivePagePanel from "./components/ActivePagePanel";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const pageState = useStudioStore((store) => store.pages.getActivePageState());

  return (
    <div className="App">
      <div className="flex flex-row w-screen h-screen">
        <ActivePagePanel />
        <div className="grow w-1/3 bg-gray-300">
          {pageState && <PagePreview pageState={pageState} />}
        </div>
        <EditorPanel />
      </div>
    </div>
  );
}
