import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import { ViewportStyles } from "./components/Viewport/defaults";
import { useState } from "react";

export default function App() {
  const [viewportDimensions, setViewportDimensions] = useState<ViewportStyles>({
    name: "Reset Viewport",
    height: window.innerHeight,
    width: window.innerWidth,
  });

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar setViewportDimensions={setViewportDimensions} />
        <div className="flex flex-row grow">
          <LeftSidebar />
          <div className="grow w-1/3 bg-white border-8 shadow">
            <PreviewWithUseComponents viewportDimensions={viewportDimensions} />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
