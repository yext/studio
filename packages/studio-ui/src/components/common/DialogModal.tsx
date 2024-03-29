import { ReactComponent as X } from "../../icons/x.svg";
import classNames from "classnames";
import Modal from "./Modal";
import { useMemo } from "react";

interface DialogModalProps {
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

export default function DialogModal({
  isOpen,
  title,
  body,
  errorMessage,
  handleClose,
  handleConfirm,
  isConfirmButtonDisabled,
  confirmButtonText = "Ok",
  confirmButtonEnabledColor,
}: DialogModalProps) {
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

  const modalBodyContent = useMemo(() => {
    return (
      <>
        <div className="flex justify-between items-center font-bold mb-4">
          {title}
          <button onClick={handleClose} aria-label="Close Modal">
            <X />
          </button>
        </div>
        {body}
        <div className={footerClasses}>
          {errorMessage && (
            <div className="flex justify-start whitespace-pre-wrap text-red-600">
              {errorMessage}
            </div>
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
      </>
    );
  }, [
    body,
    confirmButtonClasses,
    confirmButtonText,
    errorMessage,
    footerClasses,
    handleClose,
    handleConfirm,
    isConfirmButtonDisabled,
    title,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      body={modalBodyContent}
      title={title}
      handleClose={handleClose}
    />
  );
}
