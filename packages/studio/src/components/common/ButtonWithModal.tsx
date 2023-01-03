import { ReactElement, useCallback, useState } from "react";
import Modal from "./Modal";
import InputModal from "./InputModal";

type ModalType = typeof Modal | typeof InputModal;
export type renderModalFunction = (
  isOpen: boolean,
  handleClose: () => void
) => ReactElement<Parameters<ModalType>, ModalType>;

interface ButtonWithModalProps {
  buttonIcon: JSX.Element;
  renderModal: renderModalFunction;
}

export default function ButtonWithModal({
  buttonIcon,
  renderModal,
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
      <button onClick={handleButtonClick}>{buttonIcon}</button>
      {renderModal(showModal, handleModalClose)}
    </>
  );
}
