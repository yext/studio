import { ReactComponent as Hexagon } from "../icons/hexagon.svg";
import { ReactComponent as Box } from "../icons/box.svg";
import { ReactComponent as Container } from "../icons/container.svg";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import { useCallback, useState } from "react";
import classNames from "classnames";
import { v4 } from "uuid";
import useStudioStore from "../store/useStudioStore";

enum ElementType {
  Components = "Components",
  Containers = "Containers",
  Modules = "Modules",
}

const elementTypeToIcon = {
  Components: <Box />,
  Containers: <Container />,
  Modules: <Hexagon />,
} as const;

export default function AddElementMenu() {
  const [activeType, setType] = useState<ElementType>(ElementType.Components);
  const UUIDToFileMetadata = useStudioStore((store) => {
    return store.fileMetadatas.UUIDToFileMetadata;
  });

  return (
    <div className="absolute z-10 rounded bg-white text-sm text-gray-700 shadow-lg">
      <div className="flex px-4 pt-2 border-b">
        {Object.keys(ElementType).map((elementType) => {
          return (
            <ElementTypeButton
              key={elementType}
              activeType={activeType}
              elementType={elementType}
              setType={setType}
            />
          );
        })}
      </div>
      <div className="py-1">
        {Object.values(UUIDToFileMetadata)
          .filter((metadata) => {
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
          })
          .map((metadata) => {
            return <Options metadata={metadata} key={metadata.metadataUUID} />;
          })}
      </div>
    </div>
  );
}

function ElementTypeButton(props: {
  activeType: ElementType;
  elementType: string;
  setType: (type: ElementType) => void;
}) {
  const { activeType, elementType, setType } = props;
  const className = classNames(
    "px-2 py-2 mx-2 flex items-center cursor-pointer border-b-2",
    {
      "border-blue-600": activeType === elementType,
      "border-transparent": activeType !== elementType,
    }
  );
  const handleClick = useCallback(() => {
    setType(ElementType[elementType]);
  }, [elementType, setType]);
  return (
    <div className={className} onClick={handleClick}>
      <span className="mr-2 pt-0.5">{elementTypeToIcon[elementType]}</span>
      <span>{elementType}</span>
    </div>
  );
}

function Options({ metadata }: { metadata: FileMetadata }) {
  const componentName = metadata.filepath
    .split("/")
    .at(-1)
    ?.split(".tsx")
    .at(0);
  const [getActivePageState, setActivePageState] = useStudioStore((store) => {
    return [store.pages.getActivePageState, store.pages.setActivePageState];
  });

  const addComponent = useCallback(
    (metadata: FileMetadata, componentName: string) => {
      const activePageState = getActivePageState();
      if (!activePageState) {
        throw new Error("Tried to add component without active page state.");
      }
      const rootElement = activePageState.componentTree.find(
        (c) => !c.parentUUID
      );
      const componentState = {
        kind:
          metadata.kind === FileMetadataKind.Module
            ? ComponentStateKind.Module
            : ComponentStateKind.Standard,
        componentName,
        props: metadata.initialProps ?? {},
        uuid: v4(),
        metadataUUID: metadata.metadataUUID,
        parentUUID: rootElement?.uuid,
      };
      setActivePageState({
        ...activePageState,
        componentTree: [...activePageState.componentTree, componentState],
      });
    },
    [getActivePageState, setActivePageState]
  );
  const handleClick = useCallback(() => {
    if (!componentName) {
      throw new Error("Invalid component filepath: " + metadata.filepath);
    }
    addComponent(metadata, componentName);
  }, [addComponent, metadata, componentName]);

  return (
    <div className="px-6 py-1 cursor-pointer" onClick={handleClick}>
      {componentName}
    </div>
  );
}
