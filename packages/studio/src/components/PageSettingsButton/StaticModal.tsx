import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import { PageSettingsModalProps } from "./PageSettingsButton";
import { getUrlDisplayValue } from "./GetUrlDisplayValue";

export type StaticPageSettings = {
  url: string;
};

export default function StaticModal({
  pageName,
  isOpen,
  handleClose,
}: PageSettingsModalProps): JSX.Element {
  const [currGetPathValue, updateGetPathValue] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
  ]);

  const initialFormValue: StaticPageSettings = useMemo(
    () => ({ url: getUrlDisplayValue(currGetPathValue, false) }),
    [currGetPathValue]
  );

  const staticFormData: FormData<StaticPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL slug:",
        optional: !currGetPathValue,
        placeholder: currGetPathValue ? "" : "URL slug is defined by developer",
      },
    }),
    [currGetPathValue]
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
      transformOnChangeValue={undefined}
    />
  );
}
