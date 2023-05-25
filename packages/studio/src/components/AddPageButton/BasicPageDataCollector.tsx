import { useCallback, useContext, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { FlowStepModalProps } from "./FlowStep";
import useStudioStore from "../../store/useStudioStore";
import AddPageContext from "./AddPageContext";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";

type BasicPageData = {
  pageName: string;
  url?: string;
};

export default function BasicPageDataCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isPagesJSRepo = useStudioStore(
    (store) => store.studioConfig.isPagesJSRepo
  );
  const { state } = useContext(AddPageContext);
  const isEntityPage = isPagesJSRepo && !state.isStatic;

  const formData: FormData<BasicPageData> = useMemo(
    () => ({
      pageName: { description: "Give the page a name:" },
      ...(isPagesJSRepo && { url: { description: "Specify the URL slug:" } }),
    }),
    [isPagesJSRepo]
  );

  const initialFormValue: BasicPageData | undefined = useMemo(() => {
    return isEntityPage ? { pageName: "", url: "[[slug]]" } : undefined;
  }, [isEntityPage]);

  const onConfirm = useCallback(
    async (data: BasicPageData) => {
      try {
        const getPathValue = data.url
          ? createGetPathVal(data.url, isEntityPage)
          : undefined;
        await handleConfirm(data.pageName, getPathValue);
        return true;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
          return false;
        } else {
          throw err;
        }
      }
    },
    [handleConfirm, isEntityPage]
  );

  const transformOnChangeValue = useCallback(
    (value: string, field: string) =>
      isEntityPage && field === "url"
        ? TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets(value)
        : value,
    [isEntityPage]
  );

  const modalTitle = isPagesJSRepo ? "Specify Page Name and URL" : "Add Page";

  return (
    <FormModal
      isOpen={isOpen}
      title={modalTitle}
      formData={formData}
      initialFormValue={initialFormValue}
      errorMessage={errorMessage}
      handleClose={handleClose}
      handleConfirm={onConfirm}
      transformOnChangeValue={transformOnChangeValue}
    />
  );
}

function createGetPathVal(url: string, isEntityPage: boolean): GetPathVal {
  return isEntityPage
    ? {
        kind: PropValueKind.Expression,
        value: TemplateExpressionFormatter.getRawValue(url),
      }
    : {
        kind: PropValueKind.Literal,
        value: url,
      };
}
