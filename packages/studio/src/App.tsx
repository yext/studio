import EditorSidebar from "./components/EditorSidebar";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";
import PreviewWithUseComponents from "./components/PreviewWithUseComponents";
import LeftSidebar from "./components/LeftSidebar";
import { Widget, addResponseMessage } from 'react-chat-widget';
import { useCallback, useEffect } from "react";
import useStudioStore from "./store/useStudioStore";

import 'react-chat-widget/lib/styles.css';

export default function App() {
  useEffect(() => {
    addResponseMessage('Welcome to this **awesome** chat!');
  }, []);

  const writeFile = useStudioStore((store) => store.actions.writeFile);
  const getAllComponentFilepaths = useStudioStore((store) => store.actions.getAllComponentFilepaths);
  const getComponentFile = useStudioStore((store) => store.actions.getComponentFile);

  writeFile("new.tsx", "abcdefhijklmnop")
  getAllComponentFilepaths().then((info) => {console.log("filepaths:", info)})
  getComponentFile("Cta.tsx").then((info) => {console.log("file:", info)})

  const handleNewUserMessage = useCallback((newMessage) => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
    addResponseMessage("hello");
  }, []);

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
      <Widget 
        handleNewUserMessage={handleNewUserMessage} 
      />
    </div>
  );
}
