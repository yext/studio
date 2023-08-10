import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import ChatBot from "./components/ChatBot";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import useStudioStore from "./store/useStudioStore";

export default function App() {
  const getTextGeneration = useStudioStore((store) => store.actions.getTextGeneration);
  const getCodeCompletion = useStudioStore((store) => store.actions.getCodeCompletion);
  const getComponentFile = useStudioStore((store) => store.actions.getComponentFile);
  const getAllComponentFilepaths = useStudioStore((store) => store.actions.getAllComponentFilepaths);
  const writeFile = useStudioStore((store) => store.actions.writeFile);

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
      <ChatBot getTextGeneration={getTextGeneration} getCodeCompletion={getCodeCompletion} getComponentFile={getComponentFile} getAllComponentFilepaths={getAllComponentFilepaths} writeFile={writeFile}/>
    </div>
  );
}
