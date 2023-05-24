import FormModal, { FormData } from "../common/FormModal";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import useStudioStore from "../../store/useStudioStore";
import { useCallback, useState } from "react";
import { ComponentStateKind } from "@yext/studio-plugin";

type CreateModuleForm = { modulePath: string };

const formData: FormData<CreateModuleForm> = {
  modulePath: { description: "Give the module a name:" },
};

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
    (form: CreateModuleForm) => {
      try {
        createModule(form.modulePath);
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
        <FormModal
          isOpen={isOpen}
          title="Create Module"
          formData={formData}
          errorMessage={errorMessage}
          handleClose={handleClose}
          handleConfirm={handleModalSave}
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
