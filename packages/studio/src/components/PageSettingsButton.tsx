import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../utils/PropValueHelpers";
import StaticModal from "./StaticModal";
import EntityModal from "./EntityModal";

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
  const isEntityPage = !!streamScope;

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      if (isEntityPage) {
        return <EntityModal
          pageName={pageName}
          isOpen={isOpen}
          handleClose={handleClose}
        />
      }
      else { 
      return <StaticModal
        pageName={pageName}
        isOpen={isOpen}
        handleClose={handleClose}
      />
      }
    },
    [isEntityPage, pageName]
  );

  return (
    <ButtonWithModal
      buttonContent={<Gear />}
      renderModal={renderModal}
      ariaLabel={`Edit ${pageName} Page Settings`}
      buttonClassName="text-gray-800 disabled:text-gray-400"
    />
  );
}

export function getUrlDisplayValue(
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
