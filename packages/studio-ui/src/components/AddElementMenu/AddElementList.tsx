import { FileMetadataKind, ComponentMetadata } from "@yext/studio-plugin";
import useStudioStore from "../../store/useStudioStore";
import { ElementType } from "./AddElementMenu";
import AddElementOption from "./AddElementOption";
import path from "path-browserify";
import renderIconForType from "../common/renderIconForType";
import { useMemo } from "react";

interface AddElementListProps {
  activeType: ElementType;
  afterSelect?: () => void;
}

/**
 * The list of available, addable elements for the current activeType.
 */
export default function AddElementList({
  activeType,
  afterSelect,
}: AddElementListProps) {
  const options = useOptions(activeType, afterSelect);

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-start py-3 pl-6 opacity-50">
        Nothing to see here!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start py-1">
      {options.map((props) => {
        return (
          <AddElementOption {...props} icon={renderIconForType(activeType)} />
        );
      })}
    </div>
  );
}

function useOptions(activeType: ElementType, afterSelect?: () => void) {
  const [UUIDToFileMetadata, layoutNameToLayoutState, addComponent, addLayout] =
    useStudioStore((store) => {
      return [
        store.fileMetadatas.UUIDToFileMetadata,
        store.layouts.layoutNameToLayoutState,
        store.actions.addComponent,
        store.actions.addLayout,
      ];
    });

  return useMemo(() => {
    if (activeType === ElementType.Layouts) {
      return Object.values(layoutNameToLayoutState).map((layoutState) => {
        return {
          displayName: path.basename(layoutState.filepath, ".tsx"),
          key: layoutState.filepath,
          handleSelect: () => {
            addLayout(layoutState);
            afterSelect?.();
          },
        };
      });
    }

    return Object.values(UUIDToFileMetadata)
      .filter((metadata): metadata is ComponentMetadata => {
        if (metadata.kind !== FileMetadataKind.Component) {
          return false;
        }
        if (activeType === ElementType.Components) {
          return !metadata.acceptsChildren;
        } else if (activeType === ElementType.Containers) {
          return !!metadata.acceptsChildren;
        }
        return false;
      })
      .map((componentMetadata) => {
        return {
          displayName: path.basename(componentMetadata.filepath, ".tsx"),
          key: componentMetadata.filepath,
          handleSelect: () => {
            addComponent(componentMetadata);
            afterSelect?.();
          },
        };
      });
  }, [
    UUIDToFileMetadata,
    activeType,
    addComponent,
    addLayout,
    afterSelect,
    layoutNameToLayoutState,
  ]);
}
