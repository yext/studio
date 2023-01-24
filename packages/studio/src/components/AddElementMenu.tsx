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
import path from "path-browserify";

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

/**
 * A menu for adding elements to the page.
 */
export default function AddElementMenu(): JSX.Element {
  const [activeType, setType] = useState<ElementType>(ElementType.Components);

  return (
    <div className="absolute z-10 rounded bg-white text-sm text-gray-700 shadow-lg">
      <div className="flex px-4 pt-2 border-b">
        {Object.keys(ElementType).map((elementType) => {
          return (
            <ElementTypeButton
              key={elementType}
              elementType={elementType}
              isActiveType={elementType === activeType}
              setType={setType}
            />
          );
        })}
      </div>
      <ElementsList activeType={activeType} />
    </div>
  );
}

/**
 * The list of available, addable elements for the current activeType.
 */
function ElementsList({ activeType }: { activeType: ElementType }) {
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

function ElementTypeButton(props: {
  isActiveType: boolean;
  elementType: string;
  setType: (type: ElementType) => void;
}) {
  const { isActiveType, elementType, setType } = props;
  const className = classNames(
    "px-2 py-2 mx-2 flex items-center cursor-pointer border-b-2",
    {
      "border-blue-600": isActiveType,
      "border-transparent": !isActiveType,
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
