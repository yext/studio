import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import { v4 } from "uuid";
import useStudioStore from "../../store/useStudioStore";
import path from "path-browserify";
import { ElementType } from "./AddElementMenu";

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
    (metadata) => {
      if (activeType === ElementType.Components) {
        return (
          metadata.kind === FileMetadataKind.Component &&
          !metadata.acceptsChildren
        );
      } else if (activeType === ElementType.Containers) {
        return (
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
        return <Option metadata={metadata} key={metadata.metadataUUID} />;
      })}
    </div>
  );
}

function Option({ metadata }: { metadata: FileMetadata }) {
  const componentName = path.basename(metadata.filepath, ".tsx");
  const [getActivePageState, setActivePageState] = useStudioStore((store) => {
    return [store.pages.getActivePageState, store.pages.setActivePageState];
  });

  const addElement = useCallback(
    (componentName: string) => {
      const activePageState = getActivePageState();
      if (!activePageState) {
        throw new Error("Tried to add component without active page state.");
      }
      const componentState = {
        kind:
          metadata.kind === FileMetadataKind.Module
            ? ComponentStateKind.Module
            : ComponentStateKind.Standard,
        componentName,
        props: metadata.initialProps ?? {},
        uuid: v4(),
        metadataUUID: metadata.metadataUUID,
      };
      setActivePageState({
        ...activePageState,
        componentTree: [...activePageState.componentTree, componentState],
      });
    },
    [getActivePageState, setActivePageState, metadata]
  );
  const handleClick = useCallback(() => {
    addElement(componentName);
  }, [addElement, componentName]);

  return (
    <button
      className="px-6 py-1 cursor-pointer hover:opacity-75"
      onClick={handleClick}
      aria-label={`Add ${componentName} Element`}
    >
      {componentName}
    </button>
  );
}
