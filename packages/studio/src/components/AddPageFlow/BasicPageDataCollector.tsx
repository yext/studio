import { useCallback, useMemo, useState } from "react";
import FormModal from "../common/FormModal";
import { FlowStepModalProps } from "./AddPageButton";
import useStudioStore from "../../store/useStudioStore";

type BasicPageData = {
  pageName: string;
  url?: string;
};

export default function BasicPageDataCollector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isPagesJSRepo = useStudioStore(
    (store) => store.studioConfig.isPagesJSRepo
  );

  const formDescriptions: BasicPageData = useMemo(
    () => ({
      pageName: "Give the page a name:",
      ...(isPagesJSRepo && { url: "Specify the URL slug:" }),
    }),
    [isPagesJSRepo]
  );

  const handleSave = useCallback(
    async (data: BasicPageData) => {
      try {
        await handleConfirm(data.pageName, data.url);
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
    [handleConfirm]
  );

  const modalTitle = isPagesJSRepo ? "Specify Page Name and URL" : "Add Page";

  return (
    <FormModal
      isOpen={isOpen}
      title={modalTitle}
      formDescriptions={formDescriptions}
      errorMessage={errorMessage}
      handleClose={handleClose}
      handleSave={handleSave}
    />
  );
}
