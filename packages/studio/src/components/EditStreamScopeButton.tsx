import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import EditStreamScopeModal from "./EditStreamScopeModal";

interface EditStreamScopeButtonProps {
  pageName: string;
}

/**
 * Renders a button for editing the Stream Scope for an Entity page in a PagesJS repo.
 * When the button is clicked, a modal is displayed where the Stream Scope can
 * be edited.
 */
export default function EditStreamScopeButton({
  pageName,
}: EditStreamScopeButtonProps): JSX.Element {
  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <EditStreamScopeModal
          pageName={pageName}
          isOpen={isOpen}
          handleClose={handleClose}
        />
      );
    },
    [pageName]
  );

  return (
    <ButtonWithModal
      buttonContent={<Gear />}
      renderModal={renderModal}
      ariaLabel={`Edit ${pageName} Stream Scope Settings`}
      buttonClassName="text-gray-800"
    />
  );
}
