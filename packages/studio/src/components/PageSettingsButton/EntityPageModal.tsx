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
  const isPathUndefined = !currGetPathValue;

  const initialFormValue: EntityPageSettings = useMemo(
    () => ({
      url: getUrlDisplayValue(currGetPathValue),
      ...StreamScopeParser.convertStreamScopeToForm(streamScope),
    }),
    [currGetPathValue, streamScope]
  );

  const entityFormData: FormData<EntityPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL slug",
        optional: isPathUndefined,
        placeholder: isPathUndefined
          ? "<URL slug is defined by developer>"
          : "",
      },
      entityIds: {
        description: "Entity IDs",
        optional: true,
      },
      entityTypes: {
        description: "Entity Type IDs",
        optional: true,
      },
      savedFilterIds: {
        description: "Saved Filter IDs",
        optional: true,
      },
    }),
    [isPathUndefined]
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
      instructions="Changing the scope of the stream (entity IDs, entity type IDs, and saved filter IDs) may result in entity data references being invalid or out of date."
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
