import { FileMetadataKind, ValidFileMetadata } from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../../store/useStudioStore";
import path from "path-browserify";
import { ElementType } from "./AddElementMenu";
import renderIconForType from "../common/renderIconForType";

/**
 * The list of available, addable elements for the current activeType.
 */
export default function AddElementsList({
  activeType,
}: {
  activeType: ElementType;
}) {
  const UUIDToFileMetadata = useStudioStore((store) => {
    return store.fileMetadatas.UUIDToFileMetadata;
  });

  const addableElements = Object.values(UUIDToFileMetadata).filter(
    (metadata): metadata is ValidFileMetadata => {
      if (activeType === ElementType.Components) {
        return (
          metadata.kind === FileMetadataKind.Component &&
          !metadata.acceptsChildren
        );
      } else if (activeType === ElementType.Containers) {
        return !!(
          metadata.kind === FileMetadataKind.Component &&
          metadata.acceptsChildren
        );
      } else {
        return metadata.kind === FileMetadataKind.Module;
      }
    }
  );

  if (addableElements.length === 0) {
    return (
      <div className="flex flex-col items-start py-3 pl-6 opacity-50">
        Nothing to see here!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start py-1">
      {addableElements.map((metadata) => {
        return (
          <Option
            metadata={metadata}
            activeType={activeType}
            key={metadata.metadataUUID}
          />
        );
      })}
    </div>
  );
}

function Option({
  metadata,
  activeType,
}: {
  metadata: ValidFileMetadata;
  activeType: ElementType;
}) {
  const componentName = path.basename(metadata.filepath, ".tsx");
  const moduleMetadataBeingEdited = useStudioStore((store) =>
    store.actions.getModuleMetadataBeingEdited()
  );
  const addComponent = useStudioStore((store) => {
    return store.actions.addComponent;
  });

  const handleClick = useCallback(() => {
    addComponent(metadata);
  }, [addComponent, metadata]);

  // Prevent users from adding infinite looping modules.
  const isSameAsActiveModule =
    moduleMetadataBeingEdited?.metadataUUID === metadata.metadataUUID;

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 disabled:opacity-25 w-full text-left"
      onClick={handleClick}
      aria-label={`Add ${componentName} Element`}
      disabled={isSameAsActiveModule}
    >
      {renderIconForType(activeType)}
      {componentName}
    </button>
  );
}
