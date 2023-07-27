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
  const [currGetPathValue, updateGetPathValue, streamScope, updateStreamScope] =
    useStudioStore((store) => [
      store.pages.pages[pageName].pagesJS?.getPathValue,
      store.pages.updateGetPathValue,
      store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.updateStreamScope,
    ]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const validateURL = (input: string) => {
    const cleanInput = input.replace(/\${document\..*?}/g, "");
    const blackListURLChars = new RegExp(/[ <>""''|\\{}[\]]/g);
    const errorChars = cleanInput.match(blackListURLChars);
    if (errorChars) {
      throw new Error(
        `URL slug contains invalid characters: ${[...new Set(errorChars)].join(
          ""
        )}`
      );
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
    (form: EntityPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Expression,
        value: TemplateExpressionFormatter.getRawValue(form.url),
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
      if (form.url || currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      updateStreamScope(pageName, StreamScopeParser.parseStreamScope(form));
      return true;
    },
    [updateGetPathValue, updateStreamScope, currGetPathValue, pageName]
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
