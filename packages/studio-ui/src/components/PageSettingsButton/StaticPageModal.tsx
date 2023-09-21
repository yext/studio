import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import { PageSettingsModalProps } from "./PageSettingsButton";
import PageDataValidator from "../../utils/PageDataValidator";

export type StaticPageSettings = {
  url: string;
};

/**
 * StaticPageModal is a form modal that displays the page settings
 * for a static page and allows editing of these settings (URL slug).
 */
export default function StaticPageModal({
  pageName,
  isOpen,
  handleClose,
}: PageSettingsModalProps): JSX.Element {
  const [isPagesJSRepo, currGetPathValue, updateGetPathValue] = useStudioStore((store) => [
    store.studioConfig.isPagesJSRepo,
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const pageDataValidator = useMemo(() => new PageDataValidator({ isEntityPage: false, isPagesJSRepo }), [isPagesJSRepo]);
  const isURLEditable = useMemo(
    () => pageDataValidator.checkIsURLEditable(currGetPathValue?.value),
    [currGetPathValue?.value, pageDataValidator]
  );

  const initialFormValue: StaticPageSettings = useMemo(
    () => ({ url: currGetPathValue?.value ?? "" }),
    [currGetPathValue]
  );

  const staticFormData: FormData<StaticPageSettings> = useMemo(
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
    (form: StaticPageSettings) => {
      const getPathValue: GetPathVal = {
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
      updateGetPathValue(pageName, getPathValue);
      return true;
    },
    [updateGetPathValue, pageName, pageDataValidator]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Page Settings"
      formData={staticFormData}
      initialFormValue={initialFormValue}
      errorMessage={errorMessage}
      requireChangesToSubmit={true}
      handleClose={handleClose}
      handleConfirm={handleModalSave}
    />
  );
}
