import { FileMetadataKind, ComponentMetadata } from "@yext/studio-plugin";
import useStudioStore from "../../store/useStudioStore";
import { ElementType } from "./AddElementMenu";
import AddElementOption from './AddElementOption';

export interface ElementSelectorProps {
  activeType: ElementType.Components | ElementType.Containers;
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
      }
      if (activeType === ElementType.Components) {
        return !metadata.acceptsChildren;
      } else if (activeType === ElementType.Containers) {
        return !!metadata.acceptsChildren;
      }
      return false;
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
          <AddElementOption
            key={metadata.metadataUUID}
            metadata={metadata}
            activeType={activeType}
            afterSelect={afterSelect}
          />
        );
      })}
    </div>
  );
}