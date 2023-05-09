import FormModal from "./common/InputModal";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Plus } from "../icons/plus.svg";
import { useCallback, useMemo, useState } from "react";

type AddPageForm = {
  pageName: string;
  url?: string;
};

/**
 * Renders a button for adding new pages to the store. When the button is
 * clicked, a modal is displayed prompting the user for a page name.
 */
export default function AddPageButton(): JSX.Element {
  const createPage = useStudioStore((store) => store.actions.createPage);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isPagesJSRepo = useStudioStore(
    (store) => store.studioConfig.isPagesJSRepo
  );

  const formDescriptions: AddPageForm = useMemo(
    () => ({
      pageName: "Give the page a name:",
      ...(isPagesJSRepo && { url: "Specify the URL slug:" }),
    }),
    [isPagesJSRepo]
  );

  const handleModalSave = useCallback(
    async (form: AddPageForm) => {
      try {
        await createPage(form.pageName, form.url);
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
    [createPage, setErrorMessage]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <FormModal
          isOpen={isOpen}
          title="Add Page"
          formDescriptions={formDescriptions}
          errorMessage={errorMessage}
          handleClose={handleClose}
          handleSave={handleModalSave}
        />
      );
    },
    [errorMessage, handleModalSave, formDescriptions]
  );

  return (
    <ButtonWithModal
      buttonContent={<Plus />}
      renderModal={renderModal}
      ariaLabel="Add Page"
    />
  );
}
