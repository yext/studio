import BasicPageDataCollector from "./BasicPageDataCollector";
import PageTypeSelector from "./PageTypeSelector";
import StreamScopeCollector from "./StreamScopeCollector";
import LayoutSelector from "./LayoutSelector";
import { LayoutState } from "@yext/studio-plugin";

export enum FlowStep {
  SelectPageType,
  GetStreamScope,
  GetBasicPageData,
  SelectLayout,
}

export interface FlowStepModalProps {
  isOpen: boolean;
  handleClose: () => Promise<void>;
  handleConfirm: (layout?: LayoutState) => Promise<void>;
}

type FlowStepModalMap = {
  [key in FlowStep]: (props: FlowStepModalProps) => JSX.Element;
};

export const flowStepModalMap: FlowStepModalMap = {
  [FlowStep.SelectPageType]: PageTypeSelector,
  [FlowStep.GetStreamScope]: StreamScopeCollector,
  [FlowStep.GetBasicPageData]: BasicPageDataCollector,
  [FlowStep.SelectLayout]: LayoutSelector,
};
