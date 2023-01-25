import { ReactElement, useCallback, useState } from "react";
import Modal from "./Modal";
import InputModal from "./InputModal";

type ModalType = typeof Modal | typeof InputModal;
export type renderModalFunction = (
  isOpen: boolean,
  handleClose: () => void
) => ReactElement<Parameters<ModalType>, ModalType>;

interface ButtonWithModalProps {
  buttonContent: JSX.Element | string;
  renderModal: renderModalFunction;
  buttonClassName?: string;
  ariaLabel?: string;
}

export default function ButtonWithModal({
  buttonContent,
  renderModal,
  buttonClassName,
  ariaLabel,
}: ButtonWithModalProps) {
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleButtonClick = useCallback(() => {
    setShowModal(true);
  }, [setShowModal]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, [setShowModal]);

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={buttonClassName}
        aria-label={ariaLabel}
      >
        {buttonContent}
      </button>
      {renderModal(showModal, handleModalClose)}
    </>
  );
}
