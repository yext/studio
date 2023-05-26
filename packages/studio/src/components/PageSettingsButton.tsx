import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback, useMemo } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import FormModal, { FormData } from "./common/FormModal";
import { Tooltip } from "react-tooltip";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../utils/PropValueHelpers";

type PageSettings = {
  url: string;
};

const formData: FormData<PageSettings> = {
  url: { description: "URL slug:" },
};

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
  const [currGetPathValue, updateGetPathValue, isEntityPage] = useStudioStore(
    (store) => [
      store.pages.pages[pageName].pagesJS?.getPathValue,
      store.pages.updateGetPathValue,
      !!store.pages.pages[pageName].pagesJS?.streamScope,
    ]
  );

  const initialFormValue: PageSettings = useMemo(
    () => ({ url: getUrlDisplayValue(currGetPathValue, isEntityPage) }),
    [currGetPathValue, isEntityPage]
  );

  const handleModalSave = useCallback(
    (form: PageSettings) => {
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
      return true;
    },
    [updateGetPathValue, pageName, isEntityPage]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <FormModal
          isOpen={isOpen}
          title="Page Settings"
          formData={formData}
          initialFormValue={initialFormValue}
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
    [handleModalSave, initialFormValue, isEntityPage]
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
