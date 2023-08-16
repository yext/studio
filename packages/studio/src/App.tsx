import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import { useRef } from "react";

export default function App() {
  const previewRef = useRef<HTMLDivElement>(null);

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <LeftSidebar />
          <div ref={previewRef} className="grow w-1/3 bg-white border-8 shadow">
            <PreviewWithUseComponents previewRef={previewRef} />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
