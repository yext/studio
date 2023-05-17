import { useMemo, useState } from "react";
import NewPageContext, {
  NewPageContextValue,
  NewPageInfo,
} from "./NewPageContext";

export default function NewPageContextProvider(props) {
  const initPageInfo: NewPageInfo = {
    name: "",
    urlPath: "",
    isStatic: true,
  };
  const [state, setState] = useState(initPageInfo);

  const contextValue: NewPageContextValue = useMemo(() => {
    return {
      state: state,
      actions: {
        setName: (name: string) => setState({ ...state, name: name }),
        setUrlPath: (urlPath: string) =>
          setState({ ...state, urlPath: urlPath }),
        setIsStatic: (isStatic: boolean) =>
          setState({ ...state, isStatic: isStatic }),
      },
    };
  }, [setState, state]);

  return (
    <NewPageContext.Provider value={contextValue}>
      {props.children}
    </NewPageContext.Provider>
  );
}
