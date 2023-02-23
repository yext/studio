import { useCallback, useRef, useState } from "react";
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
import useRootClose from "@restart/ui/useRootClose";
import useStudioStore from "../store/useStudioStore";
import AddElementMenu from "./AddElementMenu/AddElementMenu";

/**
 * AddElementButton is a button that when clicked, renders a dropdown menu for
 * adding elements to the page.
 */
export default function AddElementButton(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => {
    setIsOpen(false);
  });
  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const activePageState = useStudioStore((store) => {
    return store.pages.getActivePageState();
  });
  const moduleUUIDBeingEdited = useStudioStore(
    (store) => store.pages.moduleUUIDBeingEdited
  );

  if (!activePageState && !moduleUUIDBeingEdited) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        className="rounded-md text-white bg-blue-600 px-2 py-1 flex items-center gap-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg"
        onClick={handleClick}
        aria-label="Open Add Element Menu"
      >
        <AddIcon />
        Insert
      </button>
      {isOpen && <AddElementMenu />}
    </div>
  );
}
