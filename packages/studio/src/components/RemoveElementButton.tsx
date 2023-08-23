import useStudioStore from "../store/useStudioStore";
import { ReactComponent as X } from "../icons/x.svg";

/**
 * Renders a button for removing an element from the component tree of the
 * active page.
 */
export default function RemoveElementButton(): JSX.Element | null {
  const removeSelectedComponents = useStudioStore((store) => {
    return store.actions.removeSelectedComponents;
  });

  return (
    <button onClick={removeSelectedComponents} aria-label="Remove Element">
      <X />
    </button>
  );
}
