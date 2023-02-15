import EditorSidebar from "./components/EditorSidebar";
import ComponentTreePreview from "./components/ComponentTreePreview";
import ActivePagePanel from "./components/ActivePagePanel";
import useStudioStore from "./store/useStudioStore";
import ActionsBar from "./components/ActionsBar";
import Toast from "./components/Toast";

export default function App() {
  const [componentTree, getModuleStateBeingEdited, UUIDToFileMetadata] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.pages.getModuleStateBeingEdited,
      store.fileMetadatas.UUIDToFileMetadata,
    ]);
  const moduleStateBeingEdited = getModuleStateBeingEdited();
  const props = moduleStateBeingEdited?.props;
  const propShape =
    moduleStateBeingEdited &&
    UUIDToFileMetadata[moduleStateBeingEdited.metadataUUID].propShape;

  return (
    <div className="App">
      <Toast />
      <div className="flex flex-col w-screen h-screen">
        <ActionsBar />
        <div className="flex flex-row grow">
          <ActivePagePanel />
          <div className="grow w-1/3 bg-gray-300">
            {componentTree && (
              <ComponentTreePreview
                componentTree={componentTree}
                props={props}
                propShape={propShape}
              />
            )}
          </div>
          <EditorSidebar />
        </div>
      </div>
    </div>
  );
}
