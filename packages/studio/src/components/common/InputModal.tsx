import { ChangeEvent, useCallback, useMemo, useState } from "react";
import Modal from "./Modal";

interface InputModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  errorMessage: string;
  handleClose: () => void;
  handleSave: (input: string) => boolean;
}

export default function InputModal({
  isOpen,
  title,
  description,
  errorMessage,
  handleClose: customHandleClose,
  handleSave: customHandleSave,
}: InputModalProps) {
  const [isValidInput, setIsValidInput] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>("");

  const handleClose = useCallback(() => {
    setInputValue("");
    setIsValidInput(false);
    customHandleClose();
  }, [customHandleClose, setInputValue, setIsValidInput]);

  const handleSave = useCallback(() => {
    if (customHandleSave(inputValue)) {
      handleClose();
    } else {
      setIsValidInput(false);
    }
  }, [inputValue, customHandleSave, handleClose]);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      setInputValue(value);
      setIsValidInput(value.length > 0);
    },
    [setInputValue, setIsValidInput]
  );

  const modalBodyContent = useMemo(() => {
    return (
      <>
        <div>{description}</div>
        <input
          type="text"
          className="border border-gray-500 rounded-lg mt-2 mb-4 px-2 py-1 w-full"
          value={inputValue}
          onChange={handleInputChange}
        />
      </>
    );
  }, [description, handleInputChange, inputValue]);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      errorMessage={!isValidInput && inputValue ? errorMessage : undefined}
      handleClose={handleClose}
      handleConfirm={handleSave}
      body={modalBodyContent}
      confirmButtonText="Save"
      isConfirmButtonDisabled={!isValidInput}
    />
  );
}
