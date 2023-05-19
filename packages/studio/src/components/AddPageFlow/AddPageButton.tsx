import { useCallback, useContext, useState } from "react";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import { ReactComponent as Plus } from "../../icons/plus.svg";
import PageTypeSelector from "./PageTypeSelector";
import BasicPageDataCollector from "./BasicPageDataCollector";
import AddPageContext from "./AddPageContext";
import useStudioStore from "../../store/useStudioStore";
import AddPageContextProvider from "./AddPageContextProvider";

enum FlowStep {
  SelectPageType,
  GetBasicPageData,
}

export interface FlowStepModalProps {
  isOpen: boolean;
  handleClose: () => Promise<void>;
  handleConfirm: (pageName?: string, url?: string) => Promise<void>;
}

type FlowStepModalMap = {
  [key in FlowStep]: (props: FlowStepModalProps) => JSX.Element;
};

const flowStepModalMap: FlowStepModalMap = {
  [FlowStep.SelectPageType]: PageTypeSelector,
  [FlowStep.GetBasicPageData]: BasicPageDataCollector,
};

export default function AddPageButton() {
  return (
    <AddPageContextProvider>
      <AddPageButtonInternal />
    </AddPageContextProvider>
  );
}

function AddPageButtonInternal() {
  const [isPagesJSRepo, createPage] = useStudioStore((store) => [
    store.studioConfig.isPagesJSRepo,
    store.actions.createPage,
  ]);
  const [step, setStep] = useState(getInitialStep(isPagesJSRepo));
  const { actions } = useContext(AddPageContext);
  const { resetState } = actions;

  const handleConfirm = useCallback(
    async (pageName = "", url?: string) => {
      switch (step) {
        case FlowStep.SelectPageType:
          setStep(FlowStep.GetBasicPageData);
          break;
        case FlowStep.GetBasicPageData:
          await createPage(pageName, url);
          break;
      }
    },
    [step, createPage]
  );

  const decorateHandleClose = useCallback(
    (handleClose: () => void | Promise<void>) => async () => {
      await handleClose();
      setStep(getInitialStep(isPagesJSRepo));
      resetState();
    },
    [isPagesJSRepo, resetState]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      const FlowStepModal = flowStepModalMap[step];
      return (
        <FlowStepModal
          isOpen={isOpen}
          handleClose={decorateHandleClose(handleClose)}
          handleConfirm={handleConfirm}
        />
      );
    },
    [step, handleConfirm, decorateHandleClose]
  );

  return (
    <ButtonWithModal
      buttonContent={<Plus />}
      renderModal={renderModal}
      ariaLabel="Add Page"
    />
  );
}

function getInitialStep(isPagesJSRepo: boolean) {
  return isPagesJSRepo ? FlowStep.SelectPageType : FlowStep.GetBasicPageData;
}
