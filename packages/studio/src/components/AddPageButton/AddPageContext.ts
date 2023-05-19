import { createContext } from "react";

export interface AddPageData {
  isStatic: boolean;
}

export interface AddPageActions {
  setIsStatic: (isStatic: boolean) => void;
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
