import { ReactComponent as DeleteModuleIcon } from "../icons/deletemodule.svg";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import { useCallback, useMemo } from "react";
import { ModuleMetadata } from "@yext/studio-plugin";
import Modal from "./common/Modal";
import path from "path-browserify";
import useStudioStore from "../store/useStudioStore";
import { Tooltip } from "react-tooltip";

/**
 * Whcn clicked, deletes a module. When changes are saved to file
 * this will delete the module file.
 */
export default function DeleteModuleButton({
  metadata,
}: {
  metadata: ModuleMetadata;
}) {
  const moduleName = path.basename(metadata.filepath, ".tsx");
  const deleteModule = useStudioStore((store) => store.deleteModule);

  const modalBody = useMemo(() => {
    return (
      <div className="flex flex-col text-sm py-2 px-1">
        <div className="mb-2">
          Deleting this module will remove its status as a module, removing it
          from the Insert panel, and detach all other instances of it across
          your site. This will not delete the items themselves.
        </div>
        <div>Press 'Delete' to confirm this."</div>
      </div>
    );
  }, []);

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      function handleConfirm() {
        deleteModule(metadata);
      }
      return (
        <Modal
          isOpen={isOpen}
          title="Delete Module"
          body={modalBody}
          confirmButtonText="Delete"
          handleClose={handleClose}
          handleConfirm={handleConfirm}
          confirmButtonEnabledColor="bg-rose-700"
        />
      );
    },
    [deleteModule, metadata, modalBody]
  );

  const anchorId = `delete-module-${moduleName}`;
  return (
    <>
      <ButtonWithModal
        ariaLabel={`Delete Module ${moduleName}`}
        renderModal={renderModal}
        buttonContent={
          <DeleteModuleIcon className="hover:opacity-50" id={anchorId} />
        }
      />
      <Tooltip anchorId={anchorId} content="Delete" />
    </>
  );
}
