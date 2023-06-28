import useStudioStore from "../../store/useStudioStore";
import { ReactComponent as Gear } from "../../icons/gear.svg";
import { useCallback } from "react";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import StaticPageModal from "./StaticPageModal";
import EntityPageModal from "./EntityPageModal";

export interface PageSettingsModalProps {
  pageName: string;
  isOpen: boolean;
  handleClose: () => void | Promise<void>;
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
  const [streamScope] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.streamScope,
  ]);

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      const PageSettingsModal = !!streamScope ? EntityPageModal : StaticPageModal;
      return (
        <PageSettingsModal
          pageName={pageName}
          isOpen={isOpen}
          handleClose={handleClose}
        /> 
      )
    },
    [streamScope, pageName]
  );

  return (
    <ButtonWithModal
      buttonContent={<Gear />}
      renderModal={renderModal}
      ariaLabel={`Edit ${pageName} Page Settings`}
      buttonClassName="text-gray-800"
    />
  );
}
