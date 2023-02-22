import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import path from "path-browserify";
import { useCallback, useMemo } from "react";
import { v4 } from "uuid";
import useStudioStore from "../../store/useStudioStore";
import ComponentKindIcon from "../ComponentKindIcon";
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
  const moduleStateBeingEdited = useStudioStore((store) =>
    store.pages.getModuleStateBeingEdited()
  );
  const addComponent = useStudioStore((store) => {
    return store.actions.addComponent;
  });

  // This is used to display the icon for the component. Probably an simpler way to do this
  const componentState = useMemo(
    () => ({
      kind:
        metadata.kind === FileMetadataKind.Module
          ? ComponentStateKind.Module
          : ComponentStateKind.Standard,
      componentName,
      props: metadata.initialProps ?? {},
      uuid: v4(),
      metadataUUID: metadata.metadataUUID,
    }),
    [componentName, metadata.initialProps, metadata.kind, metadata.metadataUUID]
  );

  const addElement = useCallback(
    (componentName: string) => {
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
      addComponent(componentState);
    },
    [addComponent, metadata.initialProps, metadata.kind, metadata.metadataUUID]
  );

  const handleClick = useCallback(() => {
    addElement(componentName);
  }, [addElement, componentName]);

  // Prevent users from adding infinite looping modules.
  const isSameAsActiveModule =
    moduleStateBeingEdited?.metadataUUID === metadata.metadataUUID;

  return (
    <button
      className="px-6 py-2 hover:bg-gray-100 cursor-pointer disabled:opacity-25 w-full text-left flex items-center gap-2"
      onClick={handleClick}
      aria-label={`Add ${componentName} Element`}
      disabled={isSameAsActiveModule}
    >
      <ComponentKindIcon componentState={componentState} />
      {componentName}
    </button>
  );
}
