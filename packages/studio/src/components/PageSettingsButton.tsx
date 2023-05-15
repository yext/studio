import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback, useMemo } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import FormModal from "./common/FormModal";
import { Tooltip } from "react-tooltip";
import { PropValueKind } from "@yext/studio-plugin";

type PageSettings = {
  url: string;
};

const formDescriptions: PageSettings = {
  url: "URL slug:",
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
  const [currGetPathValue, updateGetPathValue] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
  ]);

  const initialFormValue: PageSettings = useMemo(
    () => ({ url: currGetPathValue?.value ?? "" }),
    [currGetPathValue]
  );

  const handleModalSave = useCallback(
    (form: PageSettings) => {
      updateGetPathValue(pageName, form.url);
      return true;
    },
    [updateGetPathValue, pageName]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <FormModal
          isOpen={isOpen}
          title="Page Settings"
          formDescriptions={formDescriptions}
          initialFormValue={initialFormValue}
          handleClose={handleClose}
          handleSave={handleModalSave}
        />
      );
    },
    [handleModalSave, initialFormValue]
  );

  // TODO (SLAP-2714): Add support for editing expressions
  const disabled =
    !currGetPathValue || currGetPathValue.kind === PropValueKind.Expression;
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
