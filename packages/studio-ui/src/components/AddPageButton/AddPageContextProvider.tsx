import { PropsWithChildren, useMemo, useState } from "react";
import AddPageContext, {
  AddPageContextValue,
  AddPageData,
} from "./AddPageContext";
import { GetPathVal, StreamScope } from "@yext/studio-plugin";

const initialPageData: AddPageData = {
  isStatic: true,
};

export default function AddPageContextProvider(props: PropsWithChildren) {
  const [state, setState] = useState(initialPageData);

  const contextValue: AddPageContextValue = useMemo(
    () => ({
      state,
      actions: {
        setIsStatic: (isStatic: boolean) =>
          setState((state) => {
            return { ...state, isStatic };
          }),
        setStreamScope: (streamScope: StreamScope) =>
          setState((state) => {
            return { ...state, streamScope };
          }),
        setPageName: (pageName: string) =>
          setState((state) => {
            return { ...state, pageName };
          }),
        setGetPathVal: (getPathVal: GetPathVal) =>
          setState((state) => {
            return { ...state, getPathVal };
          }),
        resetState: () => setState(initialPageData),
      },
    }),
    [state]
  );

  return (
    <AddPageContext.Provider value={contextValue}>
      {props.children}
    </AddPageContext.Provider>
  );
}
