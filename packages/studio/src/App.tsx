import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import ChatBot from "./components/ChatBot";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const writeFile = useStudioStore((store) => store.actions.writeFile);
  const getAllComponentFilepaths = useStudioStore((store) => store.actions.getAllComponentFilepaths);
  const getComponentFile = useStudioStore((store) => store.actions.getComponentFile);

  writeFile("new.tsx", "abcdefhijklmnop")
  getAllComponentFilepaths().then((info) => {console.log("filepaths:", info)})
  getComponentFile("Cta.tsx").then((info) => {console.log("file:", info)})

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <LeftSidebar />
          <div className="grow w-1/3 bg-white border-8 shadow">
            <PreviewWithUseComponents />
          </div>
          <EditorSidebar />
        </div>
      </div>
      <ChatBot />
    </div>
  );
}
