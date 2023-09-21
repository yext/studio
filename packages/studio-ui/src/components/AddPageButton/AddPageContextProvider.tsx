import { PropsWithChildren, useMemo, useState } from "react";
import AddPageContext, {
  AddPageContextValue,
  AddPageData,
} from "./AddPageContext";

const initialPageData: AddPageData = {
  isStatic: true,
  pageName: "",
};

export default function AddPageContextProvider(props: PropsWithChildren) {
  const [state, setState] = useState(initialPageData);

  const contextValue: AddPageContextValue = useMemo(
    () => ({
      state,
      actions: {
        updateState: (newState: Partial<AddPageData> ) =>
          setState((oldState) => {
            return {
              ...oldState, 
              ...newState
            }
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
