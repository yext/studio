import Modal from "./common/Modal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Plus } from "../icons/plus.svg";
import { ChangeEvent, useCallback, useState } from "react";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";

export default function AddPageButton(): JSX.Element {
  const addPage = useStudioStore((store) => store.pages.addPage);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [pageName, setPageName] = useState<string>("");
  const [isValidInput, setIsValidInput] = useState<boolean>(false);

  const handleAddPage = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setPageName("");
    setIsValidInput(false);
  }, [setShowModal, setPageName, setIsValidInput]);

  const handleModalSave = useCallback(() => {
    const pagesPath = initialStudioData.studioPaths.pages;
    const filepath = path.join(pagesPath, pageName + ".tsx");
    if (addPage(filepath)) {
      handleModalClose();
    } else {
      setIsValidInput(false);
    }
  }, [pageName, addPage, handleModalClose, setIsValidInput]);

  const handleModalInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setPageName(e.target.value);
      setIsValidInput(e.target.value.length > 0);
    },
    [setPageName, setIsValidInput]
  );

  return (
    <>
      <button onClick={handleAddPage}>
        <Plus />
      </button>
      <Modal
        isOpen={showModal}
        disableSave={!isValidInput}
        showErrorMessage={!isValidInput && !!pageName}
        title="Add Page"
        description="Give the page a name:"
        errorMessage="Page name already used."
        onClose={handleModalClose}
        onSave={handleModalSave}
        onInputChange={handleModalInputChange}
      />
    </>
  );
}
