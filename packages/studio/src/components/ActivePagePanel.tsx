import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";
import { useCallback, useMemo } from "react";

/**
 * Renders the left panel of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page. Allows
 * the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function ActivePagePanel(): JSX.Element {
  const { pages, setActivePageName, activePageName } = useStudioStore(
    (store) => {
      const { pages, setActivePageName, activePageName } = store.pages;
      return { pages, setActivePageName, activePageName };
    }
  );
  const pageNames = useMemo(() => Object.keys(pages), [pages]);

  const renderPageList = useCallback(
    (pageNames: string[]) => {
      return (
        <div className="flex flex-col items-start pb-2">
          {pageNames.map((pageName) => {
            const isActivePage = activePageName === pageName;
            const checkClasses = classNames({
              invisible: !isActivePage,
            });
            function handleClick() {
              setActivePageName(pageName);
            }
            return (
              <div key={pageName} className="flex items-center pb-4 ml-2">
                <Check className={checkClasses} />
                <button
                  disabled={isActivePage}
                  onClick={handleClick}
                  className="ml-2"
                >
                  {pageName}
                </button>
              </div>
            );
          })}
        </div>
      );
    },
    [activePageName, setActivePageName]
  );

  return (
    <div className="flex flex-col w-1/4 px-4">
      <div className="flex flex-row font-bold py-4 justify-between items-center">
        Pages
        <AddPageButton />
      </div>
      {renderPageList(pageNames)}
      <Divider />
      <div className="font-bold">Modules</div>
      <ComponentTree />
    </div>
  );
}
