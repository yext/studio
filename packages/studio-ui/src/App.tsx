import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import LoadingOverlay from './components/LoadingOverlay';

export default function App() {
  return (
    <LoadingOverlay>
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <LeftSidebar />
          <PreviewWithUseComponents />
          <EditorSidebar />
        </div>
      </div>
      </LoadingOverlay>
  );
}
