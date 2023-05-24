import { useCallback, useMemo, useState } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { FlowStepModalProps } from "./FlowStep";
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

  const formData: FormData<BasicPageData> = useMemo(
    () => ({
      pageName: { description: "Give the page a name:" },
      ...(isPagesJSRepo && { url: { description: "Specify the URL slug:" } }),
    }),
    [isPagesJSRepo]
  );

  const onConfirm = useCallback(
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
      formData={formData}
      errorMessage={errorMessage}
      handleClose={handleClose}
      handleConfirm={onConfirm}
    />
  );
}
