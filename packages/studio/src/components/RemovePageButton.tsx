import Modal from "./common/Modal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as X } from "../icons/x.svg";
import { useCallback } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";

interface RemovePageButtonProps {
  /** The name of the page to be removed. */
  pageName: string;
}

/**
 * Renders a button for remove pages from the store. When the button is
 * clicked, a modal is displayed prompting the user to confirm the action.
 */
export default function RemovePageButton({
  pageName,
}: RemovePageButtonProps): JSX.Element {
  const removePage = useStudioStore((store) => store.pages.removePage);

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      function handleConfirm() {
        removePage(pageName);
        handleClose();
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

  return (
    <ButtonWithModal
      buttonContent={<X />}
      renderModal={renderModal}
      aria-label="Remove Page"
    />
  );
}
