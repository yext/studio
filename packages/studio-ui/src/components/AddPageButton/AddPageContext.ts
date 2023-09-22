import { GetPathVal, StreamScope } from "@yext/studio-plugin";
import { createContext } from "react";

export interface AddPageData {
  isStatic: boolean;
  streamScope?: StreamScope;
  pageName: string;
  getPathVal?: GetPathVal;
}

export interface AddPageActions {
  updateState: (newState: Partial<AddPageData>) => void;
  resetState: () => void;
}

export interface AddPageContextValue {
  state: AddPageData;
  actions: AddPageActions;
}

const AddPageContext = createContext<AddPageContextValue>(
  {} as AddPageContextValue
);
export default AddPageContext;
