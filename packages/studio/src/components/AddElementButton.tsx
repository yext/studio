import useRootClose from "@restart/ui/useRootClose";
import classNames from "classnames";
import { useCallback, useRef, useState } from "react";
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
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

  const className = classNames(
    "rounded-md text-white bg-blue-600 px-2 py-1 flex items-center gap-2 shadow-md hover:bg-blue-700 hover:shadow-lg",
    {
      "bg-gray-200": !isOpen,
      "bg-white": isOpen,
    }
  );

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        className={className}
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
