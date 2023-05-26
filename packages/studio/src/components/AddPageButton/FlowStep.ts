import { GetPathVal } from "@yext/studio-plugin";
import BasicPageDataCollector from "./BasicPageDataCollector";
import PageTypeSelector from "./PageTypeSelector";
import StreamScopeCollector from "./StreamScopeCollector";

export enum FlowStep {
  SelectPageType,
  GetStreamScope,
  GetBasicPageData,
}

export interface FlowStepModalProps {
  isOpen: boolean;
  handleClose: () => Promise<void>;
  handleConfirm: (pageName?: string, getPathVal?: GetPathVal) => Promise<void>;
}

type FlowStepModalMap = {
  [key in FlowStep]: (props: FlowStepModalProps) => JSX.Element;
};

export const flowStepModalMap: FlowStepModalMap = {
  [FlowStep.SelectPageType]: PageTypeSelector,
  [FlowStep.GetStreamScope]: StreamScopeCollector,
  [FlowStep.GetBasicPageData]: BasicPageDataCollector,
};
