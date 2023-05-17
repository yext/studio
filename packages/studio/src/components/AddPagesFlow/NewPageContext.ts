import { createContext } from "react";

export interface NewPageInfo {
  name: string;
  urlPath: string;
  isStatic: boolean;
}

export interface CreatePageActions {
  setName: (name: string) => void;
  setUrlPath: (urlPath: string) => void;
  setIsStatic: (isStatic: boolean) => void;
}

export interface NewPageContextValue {
  state: NewPageInfo;
  actions: CreatePageActions;
}

const NewPageContext = createContext<NewPageContextValue>(
  {} as NewPageContextValue
);
export default NewPageContext;
