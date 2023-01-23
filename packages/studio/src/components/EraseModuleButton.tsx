import { ReactComponent as EraseIcon } from "../icons/erasemodule.svg";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import { useCallback, useMemo } from "react";
import { ModuleMetadata } from "@yext/studio-plugin";
import Modal from "./common/Modal";
import path from "path-browserify";
import useStudioStore from "../store/useStudioStore";

/**
 * Whcn clicked, erases a module. When changes are saved to file
 * this will delete the module file.
 */
export default function EraseModuleButton({
  metadata,
}: {
  metadata: ModuleMetadata;
}) {
  const moduleName = path.basename(metadata.filepath, ".tsx");
  const eraseModule = useStudioStore((store) => store.eraseModule);

  const modalBody = useMemo(() => {
    return (
      <div className="flex flex-col">
        <div className="py-2">
          Are you sure you want to erase module "{moduleName}"?
        </div>
        <div className="py-2">
          This will remove all instances from the current page, and also remove
          from it from the list of addable modules.
        </div>
      </div>
    );
  }, [moduleName]);

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      function handleConfirm() {
        eraseModule(metadata);
      }
      return (
        <Modal
          isOpen={isOpen}
          title={`Erase ${moduleName}`}
          body={modalBody}
          confirmButtonText="Erase Module"
          handleClose={handleClose}
          handleConfirm={handleConfirm}
        />
      );
    },
    [eraseModule, metadata, modalBody, moduleName]
  );

  return (
    <ButtonWithModal
      ariaLabel={`Erase Module ${moduleName}`}
      renderModal={renderModal}
      buttonContent={<EraseIcon className="hover:opacity-50" />}
    />
  );
}
