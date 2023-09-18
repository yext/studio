import { useCallback, useMemo, useState } from "react";
import DialogModal from "./common/DialogModal";
import StreamScopePicker, {
  updateScopeFieldFactory,
} from "./StreamScopePicker";
import { ResponseType, StreamScope } from "@yext/studio-plugin";
import useStudioStore from "../store/useStudioStore";
import { isEqual, sortBy } from "lodash";
import { toast } from "react-toastify";

export interface EditStreamScopeModalProps {
  pageName: string;
  isOpen: boolean;
  handleClose: () => void;
}

export default function EditStreamScopeModal(props: EditStreamScopeModalProps) {
  const { pageName, isOpen, handleClose } = props;
  const [streamScope, updateStreamScope, generateTestData] = useStudioStore(
    (store) => [
      store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.updateStreamScope,
      store.actions.generateTestData,
    ]
  );

  const originalScope = useMemo(() => streamScope ?? {}, [streamScope]);
  const [selectedScope, setSelectedScope] = useState(originalScope);

  const onConfirm = useCallback(async () => {
    updateStreamScope(pageName, selectedScope);
    const regenerateTestData = async () => {
      const response = await generateTestData();
      if (response.type === ResponseType.Error) {
        toast.error(
          "Error generating test data, but entity page settings were still updated."
        );
      }
    };
    await regenerateTestData();
    handleClose();
  }, [
    generateTestData,
    handleClose,
    pageName,
    selectedScope,
    updateStreamScope,
  ]);

  const updateSelection: updateScopeFieldFactory = useCallback(
    (streamScopeField: keyof StreamScope) => (selectedIds: string[]) => {
      if (selectedIds.length) {
        setSelectedScope({
          [streamScopeField]: selectedIds,
        });
      } else {
        setSelectedScope({});
      }
    },
    []
  );

  const hasNoChanges = useMemo(() => {
    const noScopeChanges = Object.keys(selectedScope).map((scope) =>
      isEqual(sortBy(selectedScope[scope]), sortBy(originalScope[scope]))
    );
    return noScopeChanges.every((v) => v);
  }, [selectedScope, originalScope]);

  const modalBodyContent = useMemo(() => {
    return (
      <>
        <div className="italic mb-4">
          Use one of the optional fields below to edit which entities this page
          can access. If multiple Stream Scopes were selected and all fields are
          disabled, see a developer to edit the Stream Scope.
        </div>
        <StreamScopePicker
          streamScope={selectedScope}
          updateSelection={updateSelection}
        />
      </>
    );
  }, [selectedScope, updateSelection]);

  const resetSelectedScopeAndClose = useCallback(() => {
    setSelectedScope(originalScope);
    handleClose();
  }, [handleClose, originalScope]);

  return (
    <DialogModal
      isOpen={isOpen}
      title="Edit Content Scope"
      handleClose={resetSelectedScopeAndClose}
      handleConfirm={onConfirm}
      body={modalBodyContent}
      confirmButtonText="Confirm"
      isConfirmButtonDisabled={hasNoChanges}
    />
  );
}
