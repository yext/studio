import Modal from "./common/Modal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Plus } from "../icons/plus.svg";
import { ChangeEvent, useState } from "react";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";

export default function AddPageButton(): JSX.Element {
  const addPage = useStudioStore((store) => store.pages.addPage);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [pageName, setPageName] = useState<string>("");
  const [isValidInput, setIsValidInput] = useState<boolean>(false);

  function handleAddPage() {
    setShowModal(true);
  }

  function handleModalClose() {
    setShowModal(false);
  }

  function handleModalSave() {
    const pagesPath = initialStudioData.studioPaths.pages;
    const filepath = path.join(pagesPath, pageName + ".tsx");
    if (addPage(filepath)) {
      handleModalClose();
    } else {
      setIsValidInput(false);
    }
  }

  function handleModalInputChange(e: ChangeEvent<HTMLInputElement>) {
    setPageName(e.target.value);
    if (e.target.value) {
      setIsValidInput(true);
    } else {
      setIsValidInput(false);
    }
  }

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
        errorMessage="Invalid page name."
        onClose={handleModalClose}
        onSave={handleModalSave}
        onInputChange={handleModalInputChange}
      />
    </>
  );
}
