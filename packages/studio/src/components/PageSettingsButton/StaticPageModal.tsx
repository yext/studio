import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo } from "react";
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
  const isPathUndefined = !currGetPathValue;

  const initialFormValue: StaticPageSettings = useMemo(
    () => ({ url: currGetPathValue?.value ?? "" }),
    [currGetPathValue]
  );

  const staticFormData: FormData<StaticPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL slug",
        optional: isPathUndefined,
        placeholder: isPathUndefined
          ? "<URL slug is defined by developer>"
          : "",
      },
    }),
    [isPathUndefined]
  );

  const handleModalSave = useCallback(
    (form: StaticPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Literal,
        value: form.url,
      };
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
      requireChangesToSubmit={true}
      handleClose={handleClose}
      handleConfirm={handleModalSave}
    />
  );
}
