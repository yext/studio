import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import { useState } from "react";
import { Tooltip } from "react-tooltip";

export default function App() {
  const [tooltipProps, setTooltipProps] = useState({
    open: false,
    position: { x: 0, y: 0 },
    error: "",
    anchorId: "",
  });
  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <LeftSidebar />
          <div className="grow w-1/3 bg-white border-8 shadow">
            <Tooltip
              offset={-30}
              content={tooltipProps.error}
              anchorSelect={tooltipProps.anchorId}
              className="text-sm"
              isOpen={tooltipProps.open}
              position={tooltipProps.position}
            />
            <PreviewWithUseComponents setTooltipProps={setTooltipProps} />
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
