import useImportedComponents from "../hooks/useImportedComponents";
import useStudioStore from "../store/useStudioStore";
import PagePreview from "./PagePreview";
import Highlighter from "./Highlighter";

export default function PreviewWithUseComponents() {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  void useImportedComponents(componentTree);

  return (
    <>
      <PagePreview />
      <Highlighter />
    </>
  );
}
