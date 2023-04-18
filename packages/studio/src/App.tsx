import EditorSidebar from "./components/EditorSidebar";
import ActivePagePanel from "./components/ActivePagePanel";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviwWithUseComponents";

export default function App() {
  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-white border-8 shadow">
            <PreviewWithUseComponents />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
