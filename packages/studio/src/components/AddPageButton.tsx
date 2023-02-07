import InputModal from "./common/InputModal";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Plus } from "../icons/plus.svg";
import { useCallback, useState } from "react";
import path from "path-browserify";

/**
 * Renders a button for adding new pages to the store. When the button is
 * clicked, a modal is displayed prompting the user for a page name.
 */
export default function AddPageButton(): JSX.Element {
  const addPage = useStudioStore((store) => store.pages.addPage);
  const pagesPath = useStudioStore((store) => store.studioConfig.paths.pages);
  const [errorMessage, setErrorMessage] =
    useState<string>("Invalid page name.");

  const handleModalSave = useCallback(
    (pageName: string) => {
      if (pageName.startsWith("..")) {
        setErrorMessage('Page name cannot start with "..".');
        return false;
      }

      const filepath = path.join(pagesPath, pageName + ".tsx");
      if (addPage(filepath)) {
        return true;
      } else {
        if (filepath.startsWith(pagesPath)) {
          setErrorMessage("Page name already used.");
        } else {
          setErrorMessage("Page path is invalid.");
        }
        return false;
      }
    },
    [addPage, setErrorMessage, pagesPath]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <InputModal
          isOpen={isOpen}
          title="Add Page"
          description="Give the page a name:"
          errorMessage={errorMessage}
          handleClose={handleClose}
          handleSave={handleModalSave}
        />
      );
    },
    [errorMessage, handleModalSave]
  );

  return (
    <ButtonWithModal
      buttonContent={<Plus />}
      renderModal={renderModal}
      ariaLabel="Add Page"
    />
  );
}
