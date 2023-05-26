import { useCallback, useContext, useState } from "react";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import { ReactComponent as Plus } from "../../icons/plus.svg";
import AddPageContext from "./AddPageContext";
import useStudioStore from "../../store/useStudioStore";
import AddPageContextProvider from "./AddPageContextProvider";
import { FlowStep, flowStepModalMap } from "./FlowStep";
import { GetPathVal } from "@yext/studio-plugin";

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
  const { state, actions } = useContext(AddPageContext);
  const { resetState } = actions;

  const handleConfirm = useCallback(
    async (pageName = "", getPathVal?: GetPathVal) => {
      switch (step) {
        case FlowStep.SelectPageType:
          setStep(
            state.isStatic ? FlowStep.GetBasicPageData : FlowStep.GetStreamScope
          );
          break;
        case FlowStep.GetStreamScope:
          setStep(FlowStep.GetBasicPageData);
          break;
        case FlowStep.GetBasicPageData:
          await createPage(pageName, getPathVal, state.streamScope);
          break;
      }
    },
    [step, createPage, state]
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
