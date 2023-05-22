import BasicPageDataCollector from "./BasicPageDataCollector";
import PageTypeSelector from "./PageTypeSelector";

export enum FlowStep {
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

export const flowStepModalMap: FlowStepModalMap = {
  [FlowStep.SelectPageType]: PageTypeSelector,
  [FlowStep.GetBasicPageData]: BasicPageDataCollector,
};
