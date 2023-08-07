import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../../utils/PropValueHelpers";
import StreamScopeParser, {
  StreamScopeForm,
} from "../../utils/StreamScopeParser";
import { PageSettingsModalProps } from "./PageSettingsButton";
import { StaticPageSettings } from "./StaticPageModal";
import { streamScopeFormData } from "../AddPageButton/StreamScopeCollector";
import PageDataValidator from "../../utils/PageDataValidator";
import { toast } from "react-toastify";
import { isEqual } from "lodash";

type EntityPageSettings = StaticPageSettings & StreamScopeForm;

/**
 * EntityPageModal is a form modal that displays the page settings
 * for an entity page and allows editing of these settings
 * (URL slug and stream scope).
 */
export default function EntityPageModal({
  pageName,
  isOpen,
  handleClose,
}: PageSettingsModalProps): JSX.Element {
  const [
    currGetPathValue,
    updateGetPathValue,
    streamScope,
    updateStreamScope,
    generateTestData,
    updateEntityFiles,
    setActiveEntityFile,
    refreshActivePageEntities,
  ] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
    store.pages.pages[pageName].pagesJS?.streamScope,
    store.pages.updateStreamScope,
    store.actions.generateTestData,
    store.pages.updateEntityFiles,
    store.pages.setActiveEntityFile,
    store.actions.refreshActivePageEntities,
  ]);
  const pageDataValidator = useMemo(() => {
    return new PageDataValidator(true);
  }, []);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const isPathEditable = useMemo(() => {
    if (!currGetPathValue) return false;
    try {
      pageDataValidator.validate({ url: currGetPathValue.value });
    } catch (error) {
      return false;
    }
    return true;
  }, [currGetPathValue, pageDataValidator]);

  const initialFormValue: EntityPageSettings = useMemo(
    () => ({
      url: isPathEditable ? getUrlDisplayValue(currGetPathValue) : "",
      ...StreamScopeParser.convertStreamScopeToForm(streamScope),
    }),
    [currGetPathValue, streamScope, isPathEditable]
  );

  const entityFormData: FormData<EntityPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL Slug",
        optional: !isPathEditable,
        placeholder: isPathEditable
          ? ""
          : "<URL slug is not editable in Studio. Consult a developer>",
        disabled: !isPathEditable,
      },
      ...streamScopeFormData,
    }),
    [isPathEditable]
  );

  const handleModalSave = useCallback(
    async (form: EntityPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Expression,
        value: TemplateExpressionFormatter.getRawValue(form.url),
      };
      try {
        pageDataValidator.validate({ url: getPathValue.value });
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
          return false;
        } else {
          throw error;
        }
      }
      if (form.url || currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      const parsedForm = StreamScopeParser.parseStreamScope(form);
      updateStreamScope(pageName, parsedForm);
      const regenerateTestData = async () => {
        try {
          const mapping = await generateTestData();
          updateEntityFiles(pageName, mapping[pageName]);
          setActiveEntityFile(mapping[pageName]?.[0]);
          await refreshActivePageEntities();
        } catch {
          toast.warn(
            "Error generating test data, but entity page settings were still updated."
          );
        }
      };
      if (!isEqual(parsedForm, streamScope)) {
        await regenerateTestData();
      }
      return true;
    },
    [
      updateGetPathValue,
      updateStreamScope,
      currGetPathValue,
      pageName,
      pageDataValidator,
      generateTestData,
      updateEntityFiles,
      setActiveEntityFile,
      refreshActivePageEntities,
      streamScope,
    ]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Page Settings"
      instructions="Use the optional fields below to specify which entities this page can access. Values should be separated by commas. Changing the scope of the stream (entity IDs, entity type IDs, and saved filter IDs) may result in entity data references being invalid or out of date."
      formData={entityFormData}
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
