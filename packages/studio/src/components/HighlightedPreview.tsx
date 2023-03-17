import useStudioStore from "../store/useStudioStore";
import ComponentTreePreview from "./ComponentTreePreview";
import Highlighter from "./Highlighter";

export default function HighlightedPreview() {
  const [componentTree, getModuleStateBeingEdited] = useStudioStore((store) => [
    store.actions.getComponentTree(),
    store.pages.getModuleStateBeingEdited,
  ]);

  if (!componentTree) {
    return null;
  }

  const moduleStateBeingEdited = getModuleStateBeingEdited();
  const props = moduleStateBeingEdited?.props;

  return (
    <>
      <ComponentTreePreview componentTree={componentTree} parentProps={props} />
      <Highlighter />
    </>
  );
}
