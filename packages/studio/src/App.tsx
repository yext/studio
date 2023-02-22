import { CSSProperties } from "react";
import ActionsBar from "./components/ActionsBar";
import ActivePagePanel from "./components/ActivePagePanel";
import EditorSidebar from "./components/EditorSidebar";
import HighlightedPreview from "./components/HighlightedPreview";
import Toast from "./components/Toast";

const actionBarHeight = "50px";
const sidebarWidth = "500px";

const baseStyles: CSSProperties = {
  position: "fixed",
  zIndex: 0,
  overflowY: "auto",
};

const actionBarStyle: CSSProperties = {
  ...baseStyles,
  height: actionBarHeight,
  left: 0,
  right: 0,
  overflow: "visible",
};
const leftSidebarStyle: CSSProperties = {
  ...baseStyles,
  width: sidebarWidth,
  top: actionBarHeight,
  bottom: 0,
  left: 0,
};
const rightSidebarStyle: CSSProperties = {
  ...baseStyles,
  width: sidebarWidth,
  top: actionBarHeight,
  bottom: 0,
  right: 0,
};
const mainContentStyle: CSSProperties = {
  ...baseStyles,
  top: actionBarHeight,
  left: sidebarWidth,
  right: sidebarWidth,
  bottom: 0,
};

export default function App() {
  return (
    <div className="App">
      <Toast />
      <div className="fixed inset-0 bg-gray-200">
        <div className=" border-r bg-white shadow " style={leftSidebarStyle}>
          <ActivePagePanel />
        </div>
        <div style={mainContentStyle} className="p-4">
          <div className="bg-white shadow border relative">
            <HighlightedPreview />
          </div>
        </div>
        <div
          className="fixed top-0 right-0 bottom-0 border-l bg-white"
          style={rightSidebarStyle}
        >
          <EditorSidebar />
        </div>
        <div className="" style={actionBarStyle}>
          <ActionsBar />
        </div>
      </div>
    </div>
  );
}
