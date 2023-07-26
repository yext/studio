import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo } from "react";
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
  const isPathEditable =
    currGetPathValue?.kind === PropValueKind.Expression &&
    currGetPathValue?.value === "document.slug";

  const initialFormValue: EntityPageSettings = useMemo(
    () => ({
      url: isPathEditable ? getUrlDisplayValue(currGetPathValue) : "",
      ...StreamScopeParser.convertStreamScopeToForm(streamScope),
    }),
    [currGetPathValue, streamScope, isPathEditable]
  );

  const entityFormData: FormData<EntityPageSettings> = useMemo(
    () => ({
      url: isPathEditable
        ? {
            description: "URL Slug",
          }
        : {
            description: "URL Slug",
            optional: true,
            placeholder:
              "<URL slug is not editable in Studio. Consult a developer>",
            disabled: true,
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
