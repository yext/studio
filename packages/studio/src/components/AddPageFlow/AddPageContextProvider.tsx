import { PropsWithChildren, useMemo, useState } from "react";
import AddPageContext, {
  AddPageContextValue,
  AddPageData,
} from "./AddPageContext";

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
          setState({ ...state, isStatic: isStatic }),
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
