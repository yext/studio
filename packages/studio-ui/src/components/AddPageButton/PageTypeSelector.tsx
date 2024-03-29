import { ChangeEvent, useCallback, useContext, useMemo } from "react";
import AddPageContext from "./AddPageContext";
import DialogModal from "../common/DialogModal";
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
  const { isStatic } = state;

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const isStatic = e.target.name === PageType.Static;
      actions.updateState({ isStatic });
    },
    [actions]
  );

  const body = useMemo(
    () => (
      <div className="ml-4">
        {Object.values(PageType).map((pageType) => (
          <div key={pageType}>
            <label>
              <input
                type="radio"
                className="mr-2"
                onChange={onChange}
                checked={pageType === PageType.Static ? isStatic : !isStatic}
                name={pageType}
              />
              {pageType} Page
            </label>
          </div>
        ))}
      </div>
    ),
    [isStatic, onChange]
  );

  return (
    <DialogModal
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      title="Select Page Type"
      body={body}
      confirmButtonText="Next"
    />
  );
}
