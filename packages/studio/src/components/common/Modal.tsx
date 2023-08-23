import ReactModal from "react-modal";

interface ModalProps {
  isOpen: boolean;
  title: string;
  body: JSX.Element;
  errorMessage?: string;
  handleClose: () => void | Promise<void>;
  isConfirmButtonDisabled?: boolean;
  confirmButtonText?: string;
  confirmButtonEnabledColor?: string;
}

const customReactModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "50%",
    bottom: "auto",
    marginRight: "-95%",
    maxWidth: "600px",
    transform: "translate(-50%, -50%)",
  },
  overlay: {
    zIndex: 1000,
  },
};

export default function Modal({
  isOpen,
  title,
  body,
  handleClose,
}: ModalProps) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customReactModalStyles}
      contentLabel={`${title} Modal`}
      ariaHideApp={false}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
    >
      {body}
    </ReactModal>
  );
}
