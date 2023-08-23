import { ReactElement, useCallback, useState } from "react";
import DialogModal from "./DialogModal";
import FormModal from "./FormModal";
import Modal from "./Modal";

type ModalType = typeof DialogModal | typeof FormModal | typeof Modal;
export type renderModalFunction = (
  isOpen: boolean,
  handleClose: () => void | Promise<void>
) => ReactElement<Parameters<ModalType>, ModalType>;

interface ButtonWithModalProps {
  buttonContent: JSX.Element | string;
  renderModal: renderModalFunction;
  buttonClassName?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function ButtonWithModal({
  buttonContent,
  renderModal,
  buttonClassName,
  ariaLabel,
  disabled = false,
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
        disabled={disabled}
      >
        {buttonContent}
      </button>
      {renderModal(showModal, handleModalClose)}
    </>
  );
}
