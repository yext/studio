import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import { PageSettingsModalProps } from "./PageSettingsButton";

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
  const [currGetPathValue, updateGetPathValue] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateURL = (input: string) => {
    const blackListURLChars = new RegExp(/[ <>""''|\\{}[\]]/g);
    if (input.match(blackListURLChars)) {
      throw new Error("URL slug contains invalid characters.");
    }
  };
  const isPathEditable = useMemo(() => {
    if (!currGetPathValue) return false;
    try {
      validateURL(currGetPathValue.value);
    } catch (error) {
      return false;
    }
    return true;
  }, [currGetPathValue]);

  const initialFormValue: StaticPageSettings = useMemo(
    () => ({ url: currGetPathValue?.value ?? "" }),
    [currGetPathValue]
  );

  const staticFormData: FormData<StaticPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL Slug",
        optional: !isPathEditable,
        placeholder: isPathEditable
          ? ""
          : "<URL slug is not editable in Studio. Consult a developer>",
        disabled: !isPathEditable,
      },
    }),
    [isPathEditable]
  );

  const handleModalSave = useCallback(
    (form: StaticPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Literal,
        value: form.url,
      };
      try {
        validateURL(getPathValue.value);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
          return false;
        } else {
          throw error;
        }
      }
      updateGetPathValue(pageName, getPathValue);
      return true;
    },
    [updateGetPathValue, pageName]
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
