import Modal from "./common/Modal";
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

  const [showModal, setShowModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  const handleAddPage = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setErrorMessage(undefined);
  }, [setShowModal, setErrorMessage]);

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

  return (
    <>
      <button onClick={handleAddPage}>
        <Plus />
      </button>
      <Modal
        isOpen={showModal}
        title="Add Page"
        description="Give the page a name:"
        errorMessage={errorMessage}
        onClose={handleModalClose}
        onSave={handleModalSave}
      />
    </>
  );
}
