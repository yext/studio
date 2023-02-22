import { ComponentStateKind } from "@yext/studio-plugin";
import { useCallback, useState } from "react";
import useStudioStore from "../../store/useStudioStore";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import InputModal from "../common/InputModal";

/**
 * Renders a button for creating a module.
 */
export default function CreateModuleButton(): JSX.Element | null {
  const [getActiveComponentState, createModule] = useStudioStore((store) => [
    store.actions.getActiveComponentState,
    store.createModule,
  ]);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleModalSave = useCallback(
    (modulePath: string) => {
      try {
        createModule(modulePath);
        return true;
      } catch (err: unknown) {
        if (err instanceof Error) {
          setErrorMessage(err.message);
          return false;
        } else {
          throw err;
        }
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
      buttonClassName="ml-4 py-1 px-3 text-gray-900 text-sm bg-gray-200 hover:bg-gray-300 rounded-md"
      renderModal={renderModal}
    />
  );
}
