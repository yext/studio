import { useCallback, useRef, useState } from "react";
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
import { ReactComponent as Hexagon } from "../icons/hexagon.svg";
import { ReactComponent as Box } from "../icons/box.svg";
import { ReactComponent as Container } from "../icons/container.svg";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import useRootClose from "@restart/ui/useRootClose";
import classNames from "classnames";
import useStudioStore from "../store/useStudioStore";
import { v4 } from "uuid";

export default function AddElementButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => setIsOpen(false));

  const [activePageState] = useStudioStore((store) => {
    return [store.pages.getActivePageState()];
  });

  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  if (!activePageState) {
    return null;
  }

  return (
    <div className="relative inline-block ml-5 mt-2" ref={containerRef}>
      <button
        className="rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
        onClick={handleClick}
      >
        <AddIcon />
      </button>
      {isOpen && <Menu />}
    </div>
  );
}

enum ComponentType {
  Components = "Components",
  Containers = "Containers",
  Modules = "Modules",
}

const componentTypeToIcon = {
  Components: <Box />,
  Containers: <Container />,
  Modules: <Hexagon />,
} as const;

function Menu() {
  const [activeType, setType] = useState<ComponentType>(
    ComponentType.Components
  );
  const UUIDToFileMetadata = useStudioStore((store) => {
    return store.fileMetadatas.UUIDToFileMetadata;
  });

  return (
    <div className="absolute z-10 rounded bg-white text-sm text-gray-700 shadow-lg">
      <div className="flex px-4 pt-2 border-b">
        {Object.keys(ComponentType).map((componentType) => {
          return (
            <ComponentTypeButton
              key={componentType}
              activeType={activeType}
              componentType={componentType}
              setType={setType}
            />
          );
        })}
      </div>
      <div className="py-1">
        {Object.values(UUIDToFileMetadata)
          .filter((metadata) => {
            if (activeType === ComponentType.Components) {
              return (
                metadata.kind === FileMetadataKind.Component &&
                !metadata.acceptsChildren
              );
            } else if (activeType === ComponentType.Containers) {
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

function ComponentTypeButton(props: {
  activeType: ComponentType;
  componentType: string;
  setType: (type: ComponentType) => void;
}) {
  const { activeType, componentType, setType } = props;
  const className = classNames(
    "px-2 py-2 mx-2 flex items-center cursor-pointer border-b-2",
    {
      "border-blue-600": activeType === componentType,
      "border-transparent": activeType !== componentType,
    }
  );
  const handleClick = useCallback(() => {
    setType(ComponentType[componentType]);
  }, [componentType, setType]);
  return (
    <div className={className} onClick={handleClick}>
      <span className="mr-2 pt-0.5">{componentTypeToIcon[componentType]}</span>
      <span>{componentType}</span>
    </div>
  );
}

function Options(props: { metadata: FileMetadata }) {
  const { metadata } = props;
  const componentName = metadata.filepath
    .split("/")
    .at(-1)
    ?.split(".tsx")
    .at(0);

  const addComponent = useStudioStore((store) => {
    return (metadata: FileMetadata, componentName: string) => {
      const activePageState = store.pages.getActivePageState();
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
      store.pages.setActivePageState({
        ...activePageState,
        componentTree: [...activePageState.componentTree, componentState],
      });
    };
  });
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
