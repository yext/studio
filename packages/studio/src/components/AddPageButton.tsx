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
  const createPage = useStudioStore((store) => store.actions.createPage);
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
      try {
        createPage(filepath)
        return true
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
          return false;
        } else {
          throw err;
        }
      }
    },
    [createPage, setErrorMessage, pagesPath]
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
