import { useCallback, useState } from "react";
import ButtonWithModal from "../common/ButtonWithModal";
import { ReactComponent as Plus } from "../../icons/plus.svg";
import NewPageContextProvider from "./NewPageContextProvider";
import PageTypeSelector from "./PageTypeSelector";
import NameAndPathSpecifier from "./NameAndPathSpecifier";

enum FlowStep {
  SelectPageType,
  AddPageMetadata,
}

export default function AddPageButton() {
  const [step, setStep] = useState(FlowStep.SelectPageType);

  // eslint-disable-next-line @typescript-eslint/require-await
  const SavePage = async function () {
    return;
  };

  const renderModal = useCallback((step: FlowStep) => {
    switch (step) {
      case FlowStep.SelectPageType:
        return (isOpen, handleClose) => (
          <NewPageContextProvider>
            <PageTypeSelector
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={() => setStep(FlowStep.AddPageMetadata)}
            />
          </NewPageContextProvider>
        );
      case FlowStep.AddPageMetadata:
        return (isOpen, handleClose) => (
          <NewPageContextProvider>
            <NameAndPathSpecifier
              isOpen={isOpen}
              handleClose={handleClose}
              handleConfirm={SavePage}
            />
          </NewPageContextProvider>
        );
    }
  }, []);

  return (
    <ButtonWithModal
      buttonContent={<Plus />}
      renderModal={renderModal(step)}
      ariaLabel="Add Page"
    />
  );
}
