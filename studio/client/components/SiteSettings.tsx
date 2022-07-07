// TODO make this use a regular UI and not a json editor
export default function SiteSettings() {
  // const editorRef = useRef<editor.IStandaloneCodeEditor>();

  return (
    <div>
      {/* <Editor
        height="300px"
        defaultLanguage="typescript"
        defaultValue={"{\n}"}
        onMount={editor => editorRef.current = editor}
      /> */}
      <button
        className='btn'
        onClick={async () => {
          // const text = await writeStudioFile('siteSettings.ts', JSON.stringify({
          //   value: editorRef.current?.getValue()
          // }));
          // toast(text);
        }}
      >
        Save
      </button>
    </div>
  )
}