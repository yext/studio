import EditorPanel from "./components/EditorPanel";
import ActivePagePanel from "./components/ActivePagePanel";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import HighlightedPreview from "./components/HighlightedPreview";

export default function App() {
  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-gray-300">
            <HighlightedPreview />
          </div>
          <EditorPanel />
        </div>
      </div>
    </div>
  );
}
