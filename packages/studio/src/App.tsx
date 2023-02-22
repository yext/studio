import ActionsBar from "./components/ActionsBar";
import ActivePagePanel from "./components/ActivePagePanel";
import EditorSidebar from "./components/EditorSidebar";
import HighlightedPreview from "./components/HighlightedPreview";
import Toast from "./components/Toast";

export default function App() {
  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen bg-gray-200">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow bg-white m-4 shadow border">
            <HighlightedPreview />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
