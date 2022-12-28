import ComponentTree from "./components/ComponentTree";
import EditorPanel from "./components/EditorPanel";
import PagePreview from "./components/PagePreview";

export default function App() {
  return (
    <div className="App">
      <div className="flex flex-row w-screen h-screen">
        <ComponentTree />
        <PagePreview />
        <EditorPanel />
      </div>
    </div>
  );
}
