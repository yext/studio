import { PropsWithChildren, useMemo, useState } from "react";
import AddPageContext, {
  AddPageContextValue,
  AddPageData,
} from "./AddPageContext";
import { StreamScope } from "@yext/studio-plugin";

const initialPageData: AddPageData = {
  isStatic: true,
};

export default function AddPageContextProvider(props: PropsWithChildren) {
  const [state, setState] = useState(initialPageData);

  const contextValue: AddPageContextValue = useMemo(
    () => ({
      state,
      actions: {
        setIsStatic: (isStatic: boolean) => setState({ ...state, isStatic }),
        setStreamScope: (streamScope: StreamScope) =>
          setState({ ...state, streamScope }),
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
