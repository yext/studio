// import { useCallback, useRef, useState } from "react";
// import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
// import useRootClose from "@restart/ui/useRootClose";
// import useStudioStore from "../store/useStudioStore";
// import AddElementMenu from "./AddElementMenu";
// import classNames from 'classnames';

export default function AddElementButton() {
  return <div>hi</div>;
  // const [isOpen, setIsOpen] = useState(false);
  // const containerRef = useRef<HTMLDivElement>(null);

  // useRootClose(containerRef, () => setIsOpen(false));
  // const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  // const activePageState = useStudioStore((store) => {
  //   return store.pages.getActivePageState();
  // });

  // if (!activePageState) {
  //   return null;
  // }

  // const className = classNames("rounded-md text-gray-700 shadow-md hover:bg-gray-50", {
  //   "bg-gray-200": !isOpen,
  //   "bg-white": isOpen
  // });

  // return (
  //   <div className="relative inline-block ml-5 mt-2" ref={containerRef}>
  //     <button
  //       className={className}
  //       onClick={handleClick}
  //     >
  //       <AddIcon />
  //     </button>
  //     {isOpen && <AddElementMenu />}
  //   </div>
  // );
}
