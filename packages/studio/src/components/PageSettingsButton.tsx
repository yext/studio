import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback, useMemo } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import FormModal from "./common/FormModal";
import { Tooltip } from "react-tooltip";
import { v4 } from "uuid";
import classNames from "classnames";

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
  const tooltipAnchorID = useMemo(() => v4(), []);

  const initialFormValue: PageSettings = useMemo(
    () => ({ url: currGetPathValue ?? "" }),
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

  const disabled = !currGetPathValue;
  const className = classNames({
    "text-gray-800": !disabled,
    "text-gray-400": disabled,
  });

  return (
    <div id={tooltipAnchorID} className={className}>
      <ButtonWithModal
        buttonContent={<Gear />}
        renderModal={renderModal}
        ariaLabel={`Edit ${pageName} Page Settings`}
        disabled={disabled}
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
