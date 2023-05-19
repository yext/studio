import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton/AddPageButton";
import ActivePagePanel from "./ActivePagePanel";

/**
 * Renders the left sidebar of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page.
 *
 * Allows the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function LeftSidebar(): JSX.Element {
  return (
    <div className="flex flex-col w-1/4 px-4">
      <div className="flex flex-row font-bold py-4 pr-2 justify-between items-center">
        Pages
        <AddPageButton />
      </div>
      <ActivePagePanel />
      <Divider />
      <div className="font-bold">Layers</div>
      <ComponentTree />
    </div>
  );
}
