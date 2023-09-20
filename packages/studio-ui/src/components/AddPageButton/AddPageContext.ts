import { StreamScope } from "@yext/studio-plugin";
import { createContext } from "react";

export interface AddPageData {
  isStatic: boolean;
  streamScope?: StreamScope;
}

export interface AddPageActions {
  setIsStatic: (isStatic: boolean) => void;
  setStreamScope: (streamScope: StreamScope) => void;
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
