import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import RemovePageButton from "./RemovePageButton";
import PageSettingsButton from "./PageSettingsButton";

/**
 * Renders the left panel of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page. Allows
 * the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function ActivePagePanel(): JSX.Element {
  const [
    pages,
    updateActivePage,
    activePageName,
    moduleUUIDBeingEdited,
    isPagesJSRepo,
  ] = useStudioStore((store) => [
    store.pages.pages,
    store.actions.updateActivePage,
    store.pages.activePageName,
    store.pages.moduleUUIDBeingEdited,
    store.studioConfig.isPagesJSRepo,
  ]);

  const pageNames = useMemo(() => {
    const names = Object.keys(pages);
    names.sort();
    return names;
  }, [pages]);

  const renderPage = useCallback(
    (pageName: string) => {
      const isActivePage =
        !moduleUUIDBeingEdited && activePageName === pageName;
      const checkClasses = classNames({
        invisible: !isActivePage,
      });
      function handleSelectPage() {
        void updateActivePage(pageName);
      }
      return (
        <li key={pageName} className="flex justify-between pb-4 px-2">
          <div className="flex items-center">
            <Check className={checkClasses} />
            <button
              disabled={isActivePage}
              onClick={handleSelectPage}
              className="ml-2"
            >
              {pageName}
            </button>
          </div>
          <div className="flex items-center space-x-3">
            {isPagesJSRepo && <PageSettingsButton pageName={pageName} />}
            <RemovePageButton pageName={pageName} />
          </div>
        </li>
      );
    },
    [activePageName, moduleUUIDBeingEdited, updateActivePage, isPagesJSRepo]
  );

  return (
    <div className="flex flex-col w-1/4 px-4">
      <div className="flex flex-row font-bold py-4 pr-2 justify-between items-center">
        Pages
        <AddPageButton />
      </div>
      <ul className="flex flex-col pb-2 items-stretch">
        {pageNames.map(renderPage)}
      </ul>
      <Divider />
      <div className="font-bold">Layers</div>
      <ComponentTree />
    </div>
  );
}
