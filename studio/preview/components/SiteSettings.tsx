import Editor from "@monaco-editor/react";
import type { editor } from 'monaco-editor'
import { useRef } from "react";
import writeStudioFile from "../endpoints/writeStudioFile";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function SiteSettings() {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  return (
    <div>
      <ToastContainer autoClose={1000}/>
      <Editor
        height="300px"
        defaultLanguage="typescript"
        defaultValue={"{\n}"}
        onMount={editor => editorRef.current = editor}
      />
      <button
        className='btn'
        onClick={async () => {
          const text = await writeStudioFile('siteSettings.ts', JSON.stringify({
            value: editorRef.current?.getValue()
          }));
          toast(text);
        }}
      >
        Save
      </button>
    </div>
  )
}