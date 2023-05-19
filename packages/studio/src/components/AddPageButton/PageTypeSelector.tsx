import { ChangeEvent, useCallback, useContext, useMemo, useState } from "react";
import AddPageContext from "./AddPageContext";
import Modal from "../common/Modal";
import { FlowStepModalProps } from "./FlowStep";

enum PageType {
  Static = "Static",
  Entity = "Entity",
}

export default function PageTypeSelector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const { state, actions } = useContext(AddPageContext);
  const [isStatic, setIsStatic] = useState(state.isStatic);

  const onClose = useCallback(async () => {
    await handleClose();
    setIsStatic(state.isStatic);
  }, [handleClose, state.isStatic]);

  const onConfirm = useCallback(async () => {
    actions.setIsStatic(isStatic);
    await handleConfirm();
  }, [isStatic, handleConfirm, actions]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setIsStatic(e.target.name === PageType.Static);
  }, []);

  const body = useMemo(
    () => (
      <div className="ml-4">
        {Object.values(PageType).map((pageType) => (
          <div key={pageType}>
            <input
              type="radio"
              className="mr-2"
              onChange={onChange}
              checked={pageType === PageType.Static ? isStatic : !isStatic}
              name={pageType}
            />
            {pageType} Page
          </div>
        ))}
      </div>
    ),
    [isStatic, onChange]
  );

  return (
    <Modal
      isOpen={isOpen}
      handleClose={onClose}
      handleConfirm={onConfirm}
      title="Select Page Type"
      body={body}
      confirmButtonText="Next"
    />
  );
}
