import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { Tooltip } from "react-tooltip";
import PageSettingsButton from "./PageSettingsButton/PageSettingsButton";
import RemovableElement from "./RemovableElement";
import { renderModalFunction } from "./common/ButtonWithModal";
import Modal from "./common/Modal";

/**
 * ActivePagePanel displays the available pages and allows the user to switch
 * between them.
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
    <ul className="flex flex-col pb-2 items-stretch">
      {pageNames.map((pageName) => (
        <PageItem pageName={pageName} key={pageName} />
      ))}
      {Object.keys(errorPages).map((pageName) => (
        <ErrorPageItem
          key={pageName}
          pageName={pageName}
          errorMessage={errorPages[pageName].message}
        />
      ))}
    </ul>
  );
}

function PageItem({ pageName }: { pageName: string }) {
  const [
    updateActivePage,
    activePageName,
    moduleUUIDBeingEdited,
    isPagesJSRepo,
  ] = useStudioStore((store) => [
    store.actions.updateActivePage,
    store.pages.activePageName,
    store.pages.moduleUUIDBeingEdited,
    store.studioConfig.isPagesJSRepo,
  ]);
  const isActivePage = !moduleUUIDBeingEdited && activePageName === pageName;
  const checkClasses = classNames({
    invisible: !isActivePage,
  });

  function handleSelectPage() {
    void updateActivePage(pageName);
  }

  const removePage = useStudioStore((store) => store.pages.removePage);
  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      async function handleConfirm() {
        removePage(pageName);
        await handleClose();
      }
      return (
        <Modal
          isOpen={isOpen}
          title="Delete Page"
          body={<div>Are you sure you want to remove page "{pageName}"?</div>}
          confirmButtonText="Delete"
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      );
    },
    [pageName, removePage]
  );

  const [showModal, setShowModal] = useState<boolean>(false);
  const handleButtonClick = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  return (
    <ListItem>
      <RemovableElement onRemove = {handleButtonClick} buttonClasses="ml-3">
        <div className="flex grow justify-between">
          <div className="flex items-center overflow-auto">
            <Check className={checkClasses} />
            <button
              disabled={isActivePage}
              onClick={handleSelectPage}
              className="ml-2"
            >
              {pageName}
            </button>
          </div>
          {isPagesJSRepo && <PageSettingsButton pageName={pageName} />}
        </div>
        {renderModal(showModal, handleModalClose)}
      </RemovableElement>
    </ListItem>

  );
}

function ErrorPageItem(props: { pageName: string; errorMessage: string }) {
  const { pageName, errorMessage } = props;
  const anchorId = `ErrorPageState-${pageName}`;

  return (
    <ListItem additionalClassNames="text-red-300">
      <div id={anchorId}>
        <Tooltip
          anchorSelect={`#${anchorId}`}
          content={errorMessage}
          className="max-w-lg text-xs"
        />
        <Check className="invisible" />
        <div className="ml-2">{pageName}</div>
      </div>
    </ListItem>
  );
}

function ListItem(props: PropsWithChildren<{ additionalClassNames?: string }>) {
  const additionalClassNames = props.additionalClassNames ?? "";
  const className = "flex grow justify-between pb-4 px-2 " + additionalClassNames;
  return <li className={className}>{props.children}</li>;
}
