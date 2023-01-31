import InputModal from "./common/InputModal";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import useStudioStore from "../store/useStudioStore";
import { useCallback, useState } from "react";
import path from "path-browserify";
import initialStudioData from "virtual:yext-studio";
import { ComponentStateKind } from "@yext/studio-plugin";

/**
 * Renders a button for creating a module.
 */
export default function CreateModuleButton(): JSX.Element | null {
  const [getActiveComponentState, createModule] = useStudioStore((store) => [
    store.actions.getActiveComponentState,
    store.createModule,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Invalid module name."
  );

  const handleModalSave = useCallback(
    (moduleName: string) => {
      const modulesPath = initialStudioData.userPaths.modules;
      const filepath = path.join(modulesPath, moduleName + ".tsx");
      if (createModule(filepath)) {
        return true;
      } else {
        if (filepath.startsWith(modulesPath)) {
          setErrorMessage("Module name already used.");
        } else {
          setErrorMessage("Module path is invalid.");
        }
        return false;
      }
    },
    [setErrorMessage, createModule]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <InputModal
          isOpen={isOpen}
          title="Create Module"
          description="Give the module a name:"
          errorMessage={errorMessage}
          handleClose={handleClose}
          handleSave={handleModalSave}
        />
      );
    },
    [errorMessage, handleModalSave]
  );

  const activeComponentState = getActiveComponentState();
  if (
    !activeComponentState ||
    activeComponentState.kind === ComponentStateKind.Module
  ) {
    return null;
  }

  return (
    <ButtonWithModal
      buttonContent="Create Module"
      buttonClassName="ml-4 py-1 px-3 text-white rounded-md bg-blue-600"
      renderModal={renderModal}
    />
  );
}
