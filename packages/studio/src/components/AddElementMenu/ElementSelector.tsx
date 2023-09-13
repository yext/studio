import { FileMetadataKind, ComponentMetadata } from "@yext/studio-plugin";
import { useCallback } from "react";
import useStudioStore from "../../store/useStudioStore";
import path from "path-browserify";
import { ElementType } from "./AddElementMenu";
import renderIconForType from "../common/renderIconForType";

interface ElementSelectorProps {
  activeType: ElementType;
  afterSelect?: () => void;
}

/**
 * The list of available, addable elements for the current activeType.
 */
export default function ElementSelector({
  activeType,
  afterSelect,
}: ElementSelectorProps) {
  const UUIDToFileMetadata = useStudioStore((store) => {
    return store.fileMetadatas.UUIDToFileMetadata;
  });

  const addableElements = Object.values(UUIDToFileMetadata).filter(
    (metadata): metadata is ComponentMetadata => {
      if (metadata.kind !== FileMetadataKind.Component) {
        return false;
      };
      if (activeType === ElementType.Components) {
        return !metadata.acceptsChildren;
      } else if (activeType === ElementType.Containers){
        return !!metadata.acceptsChildren;
      }
      return false
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
            afterSelect={afterSelect}
          />
        );
      })}
    </div>
  );
}

function Option({
  metadata,
  activeType,
  afterSelect,
}: {
  metadata: ComponentMetadata;
} & ElementSelectorProps) {
  const componentName = path.basename(metadata.filepath, ".tsx");

  const addComponent = useStudioStore((store) => {
    return store.actions.addComponent;
  });

  const handleSelect = useCallback(() => {
    addComponent(metadata);
    afterSelect?.();
  }, [afterSelect, addComponent, metadata]);

  return (
    <button
      className="flex items-center gap-x-2 px-6 py-2 cursor-pointer hover:bg-gray-100 w-full text-left"
      onClick={handleSelect}
      aria-label={`Add ${componentName} Element`}
    >
      {renderIconForType(activeType)}
      {componentName}
    </button>
  );
}
