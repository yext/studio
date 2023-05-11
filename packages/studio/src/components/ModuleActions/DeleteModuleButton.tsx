import { ReactComponent as DeleteModuleIcon } from "../../icons/deletemodule.svg";
import ButtonWithModal, {
  renderModalFunction,
} from "../common/ButtonWithModal";
import { useCallback, useMemo } from "react";
import {
  ComponentStateHelpers,
  ComponentStateKind,
  ModuleMetadata,
  TypeGuards,
} from "@yext/studio-plugin";
import Modal from "../common/Modal";
import path from "path-browserify";
import useStudioStore from "../../store/useStudioStore";
import ActionIconWrapper from "./ActionIconWrapper";

/**
 * When clicked, stages a module for deletion.
 * When the changes are committed, the module file will itself be deleted
 */
export default function DeleteModuleButton({
  metadata,
}: {
  metadata: ModuleMetadata;
}) {
  const moduleName = path.basename(metadata.filepath, ".tsx");
  const detachAllModuleInstances = useStudioStore(
    (store) => store.pages.detachAllModuleInstances
  );
  const setActiveComponentUUID = useStudioStore(
    (store) => store.pages.setActiveComponentUUID
  );
  const removeFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.removeFileMetadata
  );
  const pagesRecord = useStudioStore((store) => store.pages.pages);

  const isUsedInRepeater = Object.values(pagesRecord).some((pageState) =>
    pageState.componentTree.some(
      (c) =>
        TypeGuards.isRepeaterState(c) &&
        c.repeatedComponent.metadataUUID === metadata.metadataUUID
    )
  );

  const moduleUsages = Object.keys(pagesRecord).reduce(
    (usageList, pageName) => {
      const usageCount = pagesRecord[pageName].componentTree
        .filter(TypeGuards.isEditableComponentState)
        .map(ComponentStateHelpers.extractRepeatedState)
        .filter(
          (c) =>
            c.kind === ComponentStateKind.Module &&
            c.metadataUUID === metadata.metadataUUID
        ).length;
      usageList.push({
        pageName,
        usageCount,
      });
      return usageList;
    },
    [] as { pageName: string; usageCount: number }[]
  );

  const handleDelete = useCallback(() => {
    setActiveComponentUUID(undefined);
    detachAllModuleInstances(metadata);
    removeFileMetadata(metadata.metadataUUID);
  }, [
    setActiveComponentUUID,
    detachAllModuleInstances,
    metadata,
    removeFileMetadata,
  ]);

  const modalBody = useMemo(() => {
    return (
      <div className="flex flex-col text-sm py-2 px-1">
        <div className="mb-4">
          Deleting this module will remove its status as a module, removing it
          from the Insert panel, and detach all other instances of it across
          your site. This will not delete the page elements themselves.
          {moduleUsages.length > 0 && " This module is found on:"}
        </div>
        {moduleUsages.length > 0 && renderModuleUsages(moduleUsages)}
        <div>Press 'Delete' to confirm this."</div>
      </div>
    );
  }, [moduleUsages]);

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      return (
        <Modal
          isOpen={isOpen}
          title="Delete Module"
          body={modalBody}
          confirmButtonText="Delete"
          handleClose={handleClose}
          handleConfirm={handleDelete}
          confirmButtonEnabledColor="bg-rose-700"
        />
      );
    },
    [handleDelete, modalBody]
  );

  const tooltipText = isUsedInRepeater
    ? "Unable to delete module while it is used in a list anywhere in the site"
    : "Delete";

  return (
    <>
      <ButtonWithModal
        ariaLabel={`Delete Module ${moduleName}`}
        renderModal={renderModal}
        disabled={isUsedInRepeater}
        buttonContent={
          <ActionIconWrapper tooltip={tooltipText} disabled={isUsedInRepeater}>
            <DeleteModuleIcon />
          </ActionIconWrapper>
        }
      />
    </>
  );
}

function renderModuleUsages(
  moduleUsages: { pageName: string; usageCount: number }[]
) {
  const usages = moduleUsages.filter(({ usageCount }) => usageCount > 0);
  if (usages.length === 0) {
    return null;
  }

  const usageCountText = (usageCount: number) => {
    if (usageCount > 1) {
      return `${usageCount} instances`;
    }
    return `1 instance`;
  };

  return (
    <ul className="mb-4 list-disc ml-5">
      {usages.map(({ pageName, usageCount }) => {
        return (
          <li key={pageName}>
            {pageName}: {usageCountText(usageCount)}
          </li>
        );
      })}
    </ul>
  );
}
