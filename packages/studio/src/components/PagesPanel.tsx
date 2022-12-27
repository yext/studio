import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";

/**
 * Renders the left panel of Studio, which lists all pages and displays the
 * component tree for the active page. Allows navigation between pages and
 * rearranging of components and modules in the component tree.
 */
export default function PagesPanel(): JSX.Element {
  const { pages, setActivePageName, activePageName } = useStudioStore(
    (store) => store.pages
  );
  const pageNames = Object.keys(pages);

  function renderPageList(pageNames: string[]) {
    return (
      <div className="flex flex-col items-start pb-2">
        {pageNames.map((pageName) => {
          const isActivePage = activePageName === pageName;
          const pageNameClasses = classNames({
            "ml-2": isActivePage,
            "pl-5": !isActivePage,
          });
          function handleClick() {
            setActivePageName(pageName);
          }
          return (
            <div key={pageName} className="flex items-center pb-4 ml-2">
              {isActivePage && <Check />}
              <button
                disabled={isActivePage}
                onClick={handleClick}
                className={pageNameClasses}
              >
                {pageName}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

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
