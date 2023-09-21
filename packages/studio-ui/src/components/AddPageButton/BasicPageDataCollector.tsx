import { useCallback, useContext, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { FlowStepModalProps } from "./FlowStep";
import useStudioStore from "../../store/useStudioStore";
import AddPageContext from "./AddPageContext";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import PageDataValidator from "../../utils/PageDataValidator";

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
  const [isPagesJSRepo, pages] = useStudioStore((store) => [
    store.studioConfig.isPagesJSRepo,
    store.pages.pages,
  ]);
  const { state, actions } = useContext(AddPageContext);
  const isEntityPage = isPagesJSRepo && !state.isStatic;
  const pageDataValidator = useMemo(
    () => new PageDataValidator({ isEntityPage, isPagesJSRepo, pages }),
    [isEntityPage, isPagesJSRepo, pages]
  );

  const formData: FormData<BasicPageData> = useMemo(
    () => ({
      pageName: { description: "Page Name" },
      ...(isPagesJSRepo && { url: { description: "URL Slug" } }),
    }),
    [isPagesJSRepo]
  );

  const initialFormValue: BasicPageData | undefined = useMemo(() => {
    return isEntityPage ? { pageName: "", url: "[[slug]]" } : undefined;
  }, [isEntityPage]);

  const onConfirm = useCallback(
    async (data: BasicPageData) => {
      const getPathValue = data.url
        ? createGetPathVal(data.url, isEntityPage)
        : undefined;
      const validationResult = pageDataValidator.validate({
        ...data,
        url: getPathValue?.value,
      });
      if (!validationResult.valid) {
        setErrorMessage(validationResult.errorMessages.join("\r\n"));
        return false;
      }
      actions.updateState({
        pageName: data.pageName,
        getPathVal: getPathValue
      });
      await handleConfirm();
      return true;
    },
    [actions, handleConfirm, isEntityPage, pageDataValidator]
  );

  const transformOnChangeValue = useCallback(
    (value: string, field: string) =>
      isEntityPage && field === "url"
        ? TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets(value)
        : value,
    [isEntityPage]
  );

  const modalTitle = isPagesJSRepo ? "Page Name and URL" : "Add Page";

  return (
    <FormModal
      isOpen={isOpen}
      title={modalTitle}
      formData={formData}
      initialFormValue={initialFormValue}
      closeOnConfirm={false}
      errorMessage={errorMessage}
      handleClose={handleClose}
      handleConfirm={onConfirm}
      transformOnChangeValue={transformOnChangeValue}
      confirmButtonText="Next"
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
