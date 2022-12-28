import { ChangeEvent, useCallback, useState } from "react";
import ReactModal from "react-modal";
import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";

interface ModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  errorMessage: string;
  onClose: () => void;
  onSave: (input: string) => boolean;
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
  title,
  description,
  errorMessage,
  onClose,
  onSave,
}: ModalProps) {
  const [isValidInput, setIsValidInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleClose = useCallback(() => {
    setInputValue("");
    setIsValidInput(false);
    onClose();
  }, [onClose, setInputValue, setIsValidInput]);

  const handleSave = useCallback(() => {
    if (onSave(inputValue)) {
      handleClose();
    } else {
      setIsValidInput(false);
    }
  }, [inputValue, onSave, handleClose]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setInputValue(value);
      setIsValidInput(value.length > 0);
    },
    [setInputValue, setIsValidInput]
  );

  const showErrorMessage = !isValidInput && inputValue;
  const footerClasses = classNames("mt-2 items-center", {
    "flex justify-between": showErrorMessage,
  });
  const saveButtonClasses = classNames("ml-2 py-1 px-3 text-white rounded-md", {
    "bg-gray-400": !isValidInput,
    "bg-blue-600": isValidInput,
  });

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
      <div className="flex justify-between items-center font-bold mb-4">
        {title}
        <button onClick={handleClose}>
          <X />
        </button>
      </div>
      <div>{description}</div>
      <input
        type="text"
        className="border border-gray-500 rounded-lg mt-2 mb-4 px-2 py-1 w-full"
        value={inputValue}
        onChange={handleInputChange}
      />
      <div className={footerClasses}>
        {showErrorMessage && (
          <div className="flex justify-start text-red-600">{errorMessage}</div>
        )}
        <div className="flex justify-end">
          <button className="ml-2" onClick={handleClose}>
            Cancel
          </button>
          <button
            className={saveButtonClasses}
            disabled={!isValidInput}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </ReactModal>
  );
}
