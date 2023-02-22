import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { ReactComponent as Check } from "../icons/check.svg";
import useStudioStore from "../store/useStudioStore";
import AddPageButton from "./AddPageButton";
import Divider from "./common/Divider";
import Label from "./common/Label";
import ComponentTree from "./ComponentTree";
import RemovePageButton from "./RemovePageButton";

/**
 * Renders the left panel of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page. Allows
 * the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function ActivePagePanel(): JSX.Element {
  const {
    pages,
    setActivePage,
    activePageName,
    setModuleUUIDBeingEdited,
    getModuleStateBeingEdited,
  } = useStudioStore((store) => store.pages);
  const pageNames = useMemo(() => {
    const names = Object.keys(pages);
    names.sort();
    return names;
  }, [pages]);
  const moduleStateBeingEdited = getModuleStateBeingEdited();

  const renderPageList = useCallback(
    (pageNames: string[]) => {
      return (
        <ul className="flex flex-col pb-2 items-stretch">
          {pageNames.map((pageName) => {
            const isActivePage =
              activePageName === pageName && !moduleStateBeingEdited;
            const checkClasses = classNames({
              invisible: !isActivePage,
            });
            function handleSelectPage() {
              setActivePage(pageName);
              setModuleUUIDBeingEdited(undefined);
            }
            return (
              <li
                key={pageName}
                className="flex justify-between px-4 group hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <Check className={checkClasses} />
                  <button
                    disabled={isActivePage}
                    onClick={handleSelectPage}
                    className="ml-2 h-10"
                  >
                    {pageName}
                  </button>
                </div>
                <RemovePageButton pageName={pageName} />
              </li>
            );
          })}
        </ul>
      );
    },
    [
      activePageName,
      moduleStateBeingEdited,
      setActivePage,
      setModuleUUIDBeingEdited,
    ]
  );

  return (
    <div className="flex flex-col w-[400px] border-r bg-white shadow">
      <div className="flex flex-row py-4 pr-2 justify-between items-center">
        <Label className="px-4">Pages</Label>
        <AddPageButton />
      </div>
      {renderPageList(pageNames)}
      <div className="px-4">
        <Divider />
      </div>
      <Label className="px-4 mt-4">Layers</Label>
      <ComponentTree />
    </div>
  );
}
