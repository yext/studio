import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import { Tooltip } from "react-tooltip";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import PropValueHelpers from "../utils/PropValueHelpers";
import StaticModal from "./StaticModal";
import EntityModal from "./EntityModal";

export type PageSettings = {
  url: string;
};

interface PageSettingsButtonProps {
  pageName: string;
};

/**
 * Renders a button for editing the page-level settings for a PagesJS repo.
 * When the button is clicked, a modal is displayed where the information can
 * be edited.
 */
export default function PageSettingsButton({
  pageName,
}: PageSettingsButtonProps): JSX.Element {
  const [
    currGetPathValue,
    streamScope,
  ] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.pages[pageName].pagesJS?.streamScope,
  ]);
  const isEntityPage = !!streamScope;

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return isEntityPage ? (
        <EntityModal
          pageName={pageName}
          isOpen={isOpen}
          handleClose={handleClose}
        />
      ) : (
        <StaticModal
          pageName={pageName}
          isOpen={isOpen}
          handleClose={handleClose}
        />
      )
    },
    [isEntityPage, currGetPathValue]
  );

  return (
    <div>
      <ButtonWithModal
        buttonContent={<Gear />}
        renderModal={renderModal}
        ariaLabel={`Edit ${pageName} Page Settings`}
        buttonClassName="text-gray-800 disabled:text-gray-400"
      />
    </div>
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
