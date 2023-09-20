import { StreamScope } from "@yext/studio-plugin";
import { createContext, useContext } from "react";

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

export function useStreamScope() {
  const { state, actions } = useContext(AddPageContext);
  const { streamScope } = state;
  const { setStreamScope } = actions;
  return [streamScope, setStreamScope] as const;
}

const AddPageContext = createContext<AddPageContextValue>(
  {} as AddPageContextValue
);
export default AddPageContext;
