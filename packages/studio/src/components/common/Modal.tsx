import ReactModal from "react-modal";
import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";

interface ModalProps {
  isOpen: boolean;
  title: string;
  body: JSX.Element;
  errorMessage?: string;
  handleClose: () => void | Promise<void>;
  handleConfirm: () => void | Promise<void>;
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
  errorMessage,
  handleClose,
  handleConfirm,
  isConfirmButtonDisabled,
  confirmButtonText = "Ok",
  confirmButtonEnabledColor,
}: ModalProps) {
  const footerClasses = classNames("mt-2 items-center", {
    "flex justify-between": errorMessage,
  });
  const confirmButtonClasses = classNames(
    "ml-2 py-1 px-3 text-white rounded-md",
    {
      "bg-gray-400": isConfirmButtonDisabled,
      [confirmButtonEnabledColor ?? "bg-blue-600"]: !isConfirmButtonDisabled,
    }
  );

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      style={customReactModalStyles}
      contentLabel={`${title} Modal`}
      ariaHideApp={false}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
      role="dialog"
    >
      <div className="flex justify-between items-center font-bold mb-4">
        {title}
        <button onClick={handleClose} aria-label="Close Modal">
          <X />
        </button>
      </div>
      {body}
      <div className={footerClasses}>
        {errorMessage && (
          <div className="flex justify-start text-red-600">{errorMessage}</div>
        )}
        <div className="flex justify-end">
          <button className="ml-2" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={confirmButtonClasses}
            disabled={isConfirmButtonDisabled}
            onClick={handleConfirm}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
