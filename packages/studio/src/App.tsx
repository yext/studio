import EditorPanel from "./components/EditorPanel";
import PagePreview from "./components/PagePreview";
import ActivePagePanel from "./components/ActivePagePanel";
import useStudioStore from "./store/useStudioStore";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";

export default function App() {
  const pageState = useStudioStore((store) => store.pages.getActivePageState());

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-gray-300">
            {pageState && <PagePreview pageState={pageState} />}
          </div>
          <EditorPanel />
        </div>
      </div>
    </div>
  );
}
