import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import HighlightedPreview from "./HighlightedPreview";
import Highlighter from "./Highlighter";

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  void useImportedComponents(componentTree);

  return (
    <>
      <HighlightedPreview />
      <Highlighter />
    </>
  );
}
