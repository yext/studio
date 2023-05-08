import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";
import { PropsWithChildren, useMemo } from "react";
import RemovePageButton from "./RemovePageButton";
import { Tooltip } from "react-tooltip";

/**
 * Renders the left panel of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page. Allows
 * the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function ActivePagePanel(): JSX.Element {
  const [pages, errorPages] = useStudioStore((store) => [
    store.pages.pages,
    store.pages.errorPages,
  ]);

  const pageNames = useMemo(() => {
    const names = Object.keys(pages);
    names.sort();
    return names;
  }, [pages]);

  return (
    <div className="flex flex-col w-1/4 px-4">
      <div className="flex flex-row font-bold py-4 pr-2 justify-between items-center">
        Pages
        <AddPageButton />
      </div>
      <ul className="flex flex-col pb-2 items-stretch">
        {pageNames.map((pageName) => (
          <PageItem pageName={pageName} key={pageName} />
        ))}
        {Object.keys(errorPages).map((pageName) => {
          const anchorId = `ErrorPageState-${pageName}`
          return (
            <ListItem key={pageName} additionalClassNames="text-red-300">
              <div className="flex items-center" id={anchorId}>
                <Tooltip anchorId={anchorId} content={errorPages[pageName].message} className="max-w-md text-xs"/>
                <Check className="invisible" />
                <button disabled={true} className="ml-2">
                  {pageName}
                </button>
              </div>
            </ListItem>
          );
        })}
      </ul>
      <Divider />
      <div className="font-bold">Layers</div>
      <ComponentTree />
    </div>
  );
}

function PageItem({ pageName }: { pageName: string }) {
  const [updateActivePage, activePageName, moduleUUIDBeingEdited] =
    useStudioStore((store) => [
      store.actions.updateActivePage,
      store.pages.activePageName,
      store.pages.moduleUUIDBeingEdited,
    ]);
  const isActivePage = !moduleUUIDBeingEdited && activePageName === pageName;
  const checkClasses = classNames({
    invisible: !isActivePage,
  });

  function handleSelectPage() {
    void updateActivePage(pageName);
  }

  return (
    <ListItem>
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
      <RemovePageButton pageName={pageName} />
    </ListItem>
  );
}

function ListItem(props: PropsWithChildren<{ additionalClassNames?: string }>) {
  const additionalClassNames = props.additionalClassNames ?? "";
  const className = "flex justify-between pb-4 px-2 " + additionalClassNames;
  return <li className={className}>{props.children}</li>;
}
