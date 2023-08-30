import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind, ResponseType } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../../utils/PropValueHelpers";
import StreamScopeParser, {
  StreamScopeForm,
} from "../../utils/StreamScopeParser";
import { PageSettingsModalProps } from "./PageSettingsButton";
import { StaticPageSettings } from "./StaticPageModal";
import PageDataValidator from "../../utils/PageDataValidator";
import { toast } from "react-toastify";
import { isEqual } from "lodash";

type EntityPageSettings = StaticPageSettings & StreamScopeForm;

export const streamScopeFormData: FormData<StreamScopeForm> = {
  entityIds: {
    description: "Entity IDs",
    optional: true,
    tooltip: "In the Yext platform, navigate to Content > Entities",
  },
  entityTypes: {
    description: "Entity Type IDs",
    optional: true,
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Entity Types",
  },
  savedFilterIds: {
    description: "Saved Filter IDs",
    optional: true,
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Saved Filters",
  },
};

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
  ] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
    store.pages.pages[pageName].pagesJS?.streamScope,
    store.pages.updateStreamScope,
    store.actions.generateTestData,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const pageDataValidator = useMemo(() => new PageDataValidator(true), []);
  const isURLEditable = useMemo(
    () => pageDataValidator.checkIsURLEditable(currGetPathValue?.value),
    [currGetPathValue?.value, pageDataValidator]
  );

  const initialFormValue: EntityPageSettings = useMemo(
    () => ({
      url: isURLEditable ? getUrlDisplayValue(currGetPathValue) : "",
      ...StreamScopeParser.convertStreamScopeToForm(streamScope),
    }),
    [currGetPathValue, streamScope, isURLEditable]
  );

  const entityFormData: FormData<EntityPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL Slug",
        optional: !isURLEditable,
        placeholder: isURLEditable
          ? ""
          : "<URL slug is not editable in Studio. Consult a developer>",
        disabled: !isURLEditable,
      },
      ...streamScopeFormData,
    }),
    [isURLEditable]
  );

  const handleModalSave = useCallback(
    async (form: EntityPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Expression,
        value: TemplateExpressionFormatter.getRawValue(form.url),
      };
      const validationResult = pageDataValidator.validate({
        url: getPathValue.value,
      });
      if (!validationResult.valid) {
        setErrorMessage(validationResult.errorMessages.join("\r\n"));
        return false;
      }
      if (form.url || currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      const parsedForm = StreamScopeParser.parseStreamScope(form);
      updateStreamScope(pageName, parsedForm);
      const regenerateTestData = async () => {
        const response = await generateTestData();
        if (response.type === ResponseType.Error) {
          toast.error(
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
