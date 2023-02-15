import useStudioStore from "../store/useStudioStore";
import ComponentTreePreview from "./ComponentTreePreview";
import Highlighter from "./Highlighter";

export default function HighlightedPreview() {
  const [componentTree, getModuleStateBeingEdited, UUIDToFileMetadata] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.pages.getModuleStateBeingEdited,
      store.fileMetadatas.UUIDToFileMetadata,
    ]);

  if (!componentTree) {
    return null;
  }

  const moduleStateBeingEdited = getModuleStateBeingEdited();

  const props = moduleStateBeingEdited?.props;
  const propShape =
    moduleStateBeingEdited &&
    UUIDToFileMetadata[moduleStateBeingEdited.metadataUUID].propShape;

  return (
    <>
      <ComponentTreePreview
        componentTree={componentTree}
        props={props}
        propShape={propShape}
      />
      <Highlighter />
    </>
  );
}
