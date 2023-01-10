import InputModal from "./common/InputModal";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Plus } from "../icons/plus.svg";
import { useCallback, useState } from "react";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";

/**
 * Renders a button for adding new pages to the store. When the button is
 * clicked, a modal is displayed prompting the user for a page name.
 */
export default function AddPageButton(): JSX.Element {
  const addPage = useStudioStore((store) => store.pages.addPage);
  const [errorMessage, setErrorMessage] =
    useState<string>("Invalid page name.");

  const handleModalSave = useCallback(
    (pageName: string) => {
      const pagesPath = initialStudioData.userPaths.pages;
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
    [addPage, setErrorMessage]
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
      aria-label="Add Page"
    />
  );
}
