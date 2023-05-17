import { useCallback, useContext, useMemo } from "react";
import FormModal from "../common/FormModal";
import NewPageContext from "./NewPageContext";

interface Props {
  isOpen: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
}

type AddPageForm = {
  pageName: string;
  url: string;
};

export default function NameAndPathSpecifier({
  isOpen,
  handleClose,
  handleConfirm,
}: Props) {
  const { actions } = useContext(NewPageContext);
  const handleSave = useCallback(
    (form: AddPageForm) => {
      actions.setName(form.pageName);
      actions.setUrlPath(form.url);
      handleConfirm();

      return true;
    },
    [handleConfirm, actions]
  );

  const formDescriptions: AddPageForm = useMemo(
    () => ({
      pageName: "Give the page a name:",
      url: "Specify the URL:",
    }),
    []
  );

  return (
    <FormModal
      isOpen={isOpen}
      handleClose={handleClose}
      title="Specify Page Name and URL"
      formDescriptions={formDescriptions}
      handleSave={handleSave}
    />
  );
}
