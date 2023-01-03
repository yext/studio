import { useRef, useState } from 'react';
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
import { ReactComponent as Hexagon } from "../icons/hexagon.svg";
import { ReactComponent as Box } from "../icons/box.svg";
import { ReactComponent as Container } from "../icons/container.svg";
import { ComponentStateKind, FileMetadata, FileMetadataKind } from '@yext/studio-plugin';
import useRootClose from '@restart/ui/useRootClose';
import classNames from 'classnames';
import useStudioStore from '../store/useStudioStore';
import { v4 } from 'uuid';

export default function AddComponentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => setIsOpen(false));

  const [activePageState] = useStudioStore(store => {
    return [store.pages.getActivePageState()]
  })

  if (!activePageState) {
    return null
  }

  return (
    <div className="relative inline-block ml-5 mt-2" ref={containerRef}>
      <button
        className="rounded-md border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <AddIcon />
      </button>
    {isOpen && <Options/>}
    </div>
  )
}

enum ComponentType {
  Components = 'Components',
  Containers = 'Containers',
  Modules = 'Modules'
}

const componentTypeToIcon = {
  Components: <Box/>,
  Containers: <Container/>,
  Modules: <Hexagon/>
} as const

function Options() {
  const [activeType, setType] = useState<ComponentType>(ComponentType.Components);
  const UUIDToFileMetadata = useStudioStore(store => {
    return store.fileMetadatas.UUIDToFileMetadata
  })

  const addComponent = useStudioStore(store => {
    return (metadata: FileMetadata, componentName: string) => {
      const activePageState = store.pages.getActivePageState();
      if (!activePageState) {
        throw new Error('Tried to add component without active page state.');
      }
      const rootElement = activePageState.componentTree.find(c => !c.parentUUID);
      const componentState = {
        kind: metadata.kind === FileMetadataKind.Module ? ComponentStateKind.Module : ComponentStateKind.Standard,
        componentName,
        props: {},
        uuid: v4(),
        metadataUUID: metadata.metadataUUID,
        parentUUID: rootElement?.uuid
      };
      store.pages.setActivePageState({
        ...activePageState,
        componentTree: [...activePageState.componentTree, componentState]
      });
    }
  })

  return (
    <div className="absolute z-10 rounded bg-white text-sm text-gray-700 shadow-lg">
      <div className="flex px-4 pt-2 border-b">
        {Object.keys(ComponentType).map(componentType => {
          const className = classNames("px-2 py-2 mx-2 flex items-center cursor-pointer border-b-2", {
            "border-blue-600": activeType === componentType,
            "border-transparent": activeType !== componentType
          })
          return (
            <div className={className} key={componentType} onClick={() => {
              setType(ComponentType[componentType])
            }}>
              <span className="mr-2 pt-0.5">{componentTypeToIcon[componentType]}</span>
              <span>{componentType}</span>
            </div>
          )
        })}
      </div>
      <div className="py-1">
        {Object.values(UUIDToFileMetadata).filter(metadata => {
          if (activeType === ComponentType.Components) {
            return metadata.kind === FileMetadataKind.Component && !metadata.acceptsChildren
          } else if (activeType === ComponentType.Containers) {
            return metadata.kind === FileMetadataKind.Component && metadata.acceptsChildren
          } else {
            return metadata.kind === FileMetadataKind.Module
          }
        }).map(metadata => {
          const componentName = metadata.filepath.split('/').at(-1)?.split('.tsx').at(0)
          if (!componentName) {
            throw new Error('Invalid component filepath: ' + metadata.filepath)
          }
          return <div
          className='px-6 py-1 cursor-pointer'
          onClick={() => {
            addComponent(metadata, componentName)
          }}
          key={metadata.metadataUUID}>{componentName}</div>
        })}
      </div>
    </div>
  )
}
