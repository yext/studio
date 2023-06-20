import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback, useMemo } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import FormModal, { FormData } from "./common/FormModal";
import { Tooltip } from "react-tooltip";
import { GetPathVal, PropValueKind, StreamScope } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../utils/PropValueHelpers";

type PageSettings = {
  url: string;
};

type EntityPageSettings = {
  [key in keyof StreamScope]: string;
};

const formData: FormData<PageSettings> = {
  url: { description: "URL slug:" },
};

const entityFormData: FormData<PageSettings & EntityPageSettings> = {
  url: { 
    description: "URL slug:" ,
    optional: false,
  },
  entityIds: {
    description: "Entity IDs:",
    optional: true,
  },
  entityTypes: {
    description: "Entity Types:",
    optional: true,
  },
  savedFilterIds: {
    description: "Saved Filter IDs:",
    optional: true,
  },
}

interface PageSettingsButtonProps {
  pageName: string;
}

/**
 * Renders a button for editing the page-level settings for a PagesJS repo.
 * When the button is clicked, a modal is displayed where the information can
 * be edited.
 */
export default function PageSettingsButton({
  pageName,
}: PageSettingsButtonProps): JSX.Element {
  const [currGetPathValue, updateGetPathValue, isEntityPage, streamScope, updateStreamScope] = useStudioStore(
    (store) => [
      store.pages.pages[pageName].pagesJS?.getPathValue,
      store.pages.updateGetPathValue,
      !!store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.updateStreamScope,
    ]
  );

  const initialFormValue: PageSettings = useMemo(
    () => ({ url: getUrlDisplayValue(currGetPathValue, isEntityPage) }),
    [currGetPathValue, isEntityPage]
  );

  const initialEntityFormValue: PageSettings & EntityPageSettings = useMemo(
    () => ({ 
      url: getUrlDisplayValue(currGetPathValue, isEntityPage),
      entityIds: streamScope ? streamScope["entityIds"]?.join(",") : undefined, 
      entityTypes: streamScope ? streamScope["entityTypes"]?.join(",") : undefined, 
      savedFilterIds: streamScope ? streamScope["savedFilterIds"]?.join(",") : undefined, 
    }), 
    [currGetPathValue, isEntityPage, streamScope]
  );

  const handleModalSave = useCallback(
    (form: PageSettings & EntityPageSettings) => {
      const getPathValue: GetPathVal = isEntityPage
        ? {
            kind: PropValueKind.Expression,
            value: TemplateExpressionFormatter.getRawValue(form.url),
          }
        : {
            kind: PropValueKind.Literal,
            value: form.url,
          };
      updateGetPathValue(pageName, getPathValue);
      if(isEntityPage) {
        const newStreamScope = Object.entries(form).reduce((scope, [key, val]) => {
          const values = val
            .split(",")
            .map((str) => str.trim())
            .filter((str) => str);
          if (values.length > 0 && key !== 'url') {
            scope[key] = values;
          }
          return scope;
        }, {} as StreamScope);
        updateStreamScope(pageName, newStreamScope);
      }
      return true;
    },
    [updateGetPathValue, updateStreamScope, pageName, isEntityPage]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <FormModal
          isOpen={isOpen}
          title="Page Settings"
          instructions="Changing the scope of the stream (entity IDs, entity types, and saved filter IDs) may cause entity data to be undefined."
          formData={isEntityPage ? entityFormData : formData}
          initialFormValue={isEntityPage ? initialEntityFormValue : initialFormValue}
          requireChangesToSubmit={true}
          handleClose={handleClose}
          handleConfirm={handleModalSave}
          transformOnChangeValue={
            isEntityPage
              ? TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets
              : undefined
          }
        />
      );
    },
    [handleModalSave, initialFormValue, initialEntityFormValue, isEntityPage]
  );

  const disabled = !currGetPathValue;
  const tooltipAnchorID = `PageSettingsButton-${pageName}`;

  return (
    <div id={tooltipAnchorID}>
      <ButtonWithModal
        buttonContent={<Gear />}
        renderModal={renderModal}
        ariaLabel={`Edit ${pageName} Page Settings`}
        disabled={disabled}
        buttonClassName="text-gray-800 disabled:text-gray-400"
      />
      {disabled && (
        <Tooltip
          anchorId={tooltipAnchorID}
          content="No settings available to edit via the UI."
        />
      )}
    </div>
  );
}

function getUrlDisplayValue(
  getPathValue: GetPathVal | undefined,
  isEntityPage: boolean
): string {
  if (!isEntityPage) {
    return getPathValue?.value ?? "";
  }

  const getPathExpression = PropValueHelpers.getTemplateExpression(
    getPathValue ?? { kind: PropValueKind.Literal, value: "" }
  );
  return TemplateExpressionFormatter.getTemplateStringDisplayValue(
    getPathExpression
  );
}
