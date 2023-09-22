import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import { PageSettingsModalProps } from "./PageSettingsButton";
import PageDataValidator from "../../utils/PageDataValidator";
import PropValueHelpers from "../../utils/PropValueHelpers";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";

export type PageSettings = {
  url: string;
};

/**
 * PageSettingsModal is a form modal that displays the page settings
 * for a page and allows editing of these settings (URL slug).
 */
export default function PageSettingsModal({
  pageName,
  isOpen,
  handleClose,
}: PageSettingsModalProps): JSX.Element {
  const [isEntityPage, isPagesJSRepo] = useStudioStore((store) => [
    !!store.pages.pages[pageName].pagesJS?.streamScope,
    store.studioConfig.isPagesJSRepo,
  ]);
  const [currGetPathValue, updateGetPathValue] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const pageDataValidator = useMemo(
    () => new PageDataValidator({ isEntityPage: true, isPagesJSRepo }),
    [isPagesJSRepo]
  );
  const isURLEditable = useMemo(
    () => pageDataValidator.checkIsURLEditable(currGetPathValue?.value),
    [currGetPathValue?.value, pageDataValidator]
  );

  const initialFormValue: PageSettings = useMemo(() => {
    if (isEntityPage) {
      return {
        url: isURLEditable ? getUrlDisplayValue(currGetPathValue) : "",
      };
    }
    return { url: currGetPathValue?.value ?? "" };
  }, [currGetPathValue, isEntityPage, isURLEditable]);

  const formData: FormData<PageSettings> = useMemo(
    () => ({
      url: {
        description: "URL Slug",
        optional: !isURLEditable,
        placeholder: isURLEditable
          ? ""
          : "<URL slug is not editable in Studio. Consult a developer>",
        disabled: !isURLEditable,
      },
    }),
    [isURLEditable]
  );

  const handleModalSave = useCallback(
    (form: PageSettings) => {
      const getPathValue: GetPathVal = isEntityPage
        ? {
            kind: PropValueKind.Expression,
            value: TemplateExpressionFormatter.getRawValue(form.url),
          }
        : {
            kind: PropValueKind.Literal,
            value: form.url,
          };
      const validationResult = pageDataValidator.validate({
        url: getPathValue.value,
      });
      if (!validationResult.valid) {
        setErrorMessage(validationResult.errorMessages.join("\r\n"));
        return false;
      }
      if (!isEntityPage || form.url || currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      return true;
    },
    [
      isEntityPage,
      pageDataValidator,
      currGetPathValue,
      updateGetPathValue,
      pageName,
    ]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Page Settings"
      formData={formData}
      initialFormValue={initialFormValue}
      errorMessage={errorMessage}
      requireChangesToSubmit={true}
      handleClose={handleClose}
      handleConfirm={handleModalSave}
      transformOnChangeValue={
        TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets
      }
    />
  );
}

function getUrlDisplayValue(getPathValue: GetPathVal | undefined): string {
  const getPathExpression = PropValueHelpers.getTemplateExpression(
    getPathValue ?? { kind: PropValueKind.Literal, value: "" }
  );
  return TemplateExpressionFormatter.getTemplateStringDisplayValue(
    getPathExpression
  );
}
