import { ChangeEvent } from "react";
import ReactModal from "react-modal";
import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";

interface ModalProps {
  isOpen: boolean;
  disableSave: boolean;
  showErrorMessage: boolean;
  title: string;
  description: string;
  errorMessage: string;
  onClose: () => void;
  onSave: () => void;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const customReactModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "50%",
    bottom: "auto",
    marginRight: "-30%",
    transform: "translate(-50%, -50%)",
  },
};

export default function Modal({
  isOpen,
  disableSave,
  showErrorMessage,
  title,
  description,
  errorMessage,
  onClose,
  onSave,
  onInputChange,
}: ModalProps) {
  const footerClasses = classNames("mt-2 items-center", {
    "flex justify-between": showErrorMessage,
  });
  const saveButtonClasses = classNames(
    "ml-2 bg-blue-600 py-1 px-3 text-white rounded-md",
    {
      "bg-gray-400": disableSave,
      "bg-blue-600": !disableSave,
    }
  );

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customReactModalStyles}
      contentLabel={`${title} Modal`}
      ariaHideApp={false}
      shouldCloseOnEsc={true}
      shouldCloseOnOverlayClick={true}
    >
      <div className="flex justify-between items-center font-bold mb-4">
        {title}
        <button onClick={onClose}>
          <X />
        </button>
      </div>
      <div>{description}</div>
      <input
        type="text"
        className="border border-gray-500 rounded-lg mt-2 mb-4 px-2 py-1 w-full"
        onChange={onInputChange}
      />
      <div className={footerClasses}>
        {showErrorMessage && (
          <div className="flex justify-start text-red-600">{errorMessage}</div>
        )}
        <div className="flex justify-end">
          <button className="ml-2" onClick={onClose}>
            Cancel
          </button>
          <button
            className={saveButtonClasses}
            disabled={disableSave}
            onClick={onSave}
          >
            Save
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
