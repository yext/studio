import {
  Classes,
  DndProvider,
  DropOptions,
  getBackendOptions,
  MultiBackend,
  NodeModel,
  PlaceholderRenderParams,
  RenderParams,
  Tree,
} from "@minoru/react-dnd-treeview";
import {
  ComponentState,
  ComponentTreeHelpers,
  TypeGuards,
} from "@yext/studio-plugin";
import { useCallback, useMemo, useState } from "react";
import {
  getComponentDisplayName,
  useComponentNames,
} from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";
import ComponentNode from "./ComponentNode";
import { isEqual } from "lodash";

const ROOT_ID = "tree-root-uuid";
const TREE_CSS_CLASSES: Readonly<Classes> = {
  root: "overflow-x-auto py-2",
  placeholder: "relative",
  listItem: "relative",
};

/**
 * ComponentTree renders the active {@link PageState.componentTree}
 */
export default function ComponentTree(): JSX.Element | null {
  const tree: NodeModel<ComponentState>[] | undefined = useTree();
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const initialOpen = useMemo(() => {
    return (
      tree?.reduce((prev, curr) => {
        if (!(curr.id in openIds) || openIds[curr.id]) {
          prev.push(curr.id);
        }
        return prev;
      }, [] as (string | number)[]) ?? []
    );
  }, [openIds, tree]);

  const handleDrop = useDropHandler();
  const renderDragPreview = useDragPreview();

  const onToggle = useCallback(
    (nodeId: string, newOpenValue: boolean) => {
      setOpenIds({
        ...openIds,
        [nodeId]: newOpenValue,
      });
    },
    [openIds, setOpenIds]
  );

  const renderNodeCallback = useCallback(
    (node: NodeModel<ComponentState>, renderParams: RenderParams) => {
      const { depth, isOpen, hasChild } = renderParams;
      if (!node.data) {
        throw new Error(`Node missing data ${JSON.stringify(node, null, 2)}`);
      }
      return (
        <ComponentNode
          componentState={node.data}
          depth={depth}
          isOpen={isOpen}
          onToggle={onToggle}
          hasChild={hasChild}
        />
      );
    },
    [onToggle]
  );

  if (!tree) {
    return null;
  }

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={tree}
        rootId={ROOT_ID}
        classes={TREE_CSS_CLASSES}
        dropTargetOffset={4}
        initialOpen={initialOpen}
        sort={false}
        insertDroppableFirst={false}
        onDrop={handleDrop}
        canDrop={canDrop}
        render={renderNodeCallback}
        dragPreviewRender={renderDragPreview}
        placeholderRender={renderPlaceholder}
      />
    </DndProvider>
  );
}

function renderPlaceholder(_: NodeModel, { depth }: PlaceholderRenderParams) {
  const Placeholder = () => {
    const placeHolderStyle = useMemo(
      () => ({ left: `${depth}em`, width: `calc(100% - ${depth}em)` }),
      []
    );
    return (
      <div
        className="bg-rose-500 absolute h-0.5 z-10"
        style={placeHolderStyle}
      ></div>
    );
  };
  return <Placeholder />;
}

function useDragPreview() {
  const selectedComponentUUIDs = useStudioStore((store) => {
    return store.pages.selectedComponentUUIDs;
  });
  const componentNames = useComponentNames(selectedComponentUUIDs);
  return () => (
    <div className="p-2 rounded bg-emerald-200 w-fit">
      {componentNames.map((name, index) => (
        <div key={selectedComponentUUIDs[index]} className="flex">
          {name}
        </div>
      ))}
    </div>
  );
}

function canDrop(_: NodeModel<ComponentState>[], opts: DropOptions) {
  const { dragSource, dropTarget, dropTargetId } = opts;
  if (dropTarget !== undefined && !dropTarget.droppable) {
    return false;
  }
  if (dragSource?.parent === dropTargetId || dropTargetId === ROOT_ID) {
    return true;
  }
  // For this drag and drop library, returning undefined has different behavior than returning false.
  // It means to use the default behavior.
  return undefined;
}

function useTree(): NodeModel<ComponentState>[] | undefined {
  const [componentTree, getFileMetadata] = useStudioStore((store) => {
    return [
      store.actions.getComponentTree(),
      store.fileMetadatas.getFileMetadata,
    ];
  });

  const tree = useMemo(() => {
    return componentTree?.map((componentState) => {
      const fileMetadata = componentState?.metadataUUID
        ? getFileMetadata(componentState.metadataUUID)
        : undefined;
      const droppable = TypeGuards.canAcceptChildren(
        componentState,
        fileMetadata
      );
      return {
        id: componentState.uuid,
        parent: componentState.parentUUID ?? ROOT_ID,
        data: componentState,
        text: getComponentDisplayName(componentState),
        droppable,
      };
    });
  }, [componentTree, getFileMetadata]);

  return tree;
}

function useDropHandler() {
  const [selectedComponentUUIDs, componentTree, updateComponentTree] =
    useStudioStore((store) => {
      return [
        store.pages.selectedComponentUUIDs,
        store.actions.getComponentTree(),
        store.actions.updateComponentTree,
        store.pages.clearSelectedComponents,
        store.pages.addSelectedComponentUUID,
      ];
    });

  const handleSelectedDrop = useCallback(
    (
      updatedComponentTree: ComponentState[],
      dragSourceId: string,
      destinationParentId: string
    ) => {
      if (!componentTree) {
        throw new Error(
          "Unable to handle drag and drop event: component tree is undefined."
        );
      }
      console.log(ComponentTreeHelpers.mapComponentTree(componentTree, (c) => c.uuid))
      console.log(ComponentTreeHelpers.mapComponentTree(componentTree, (c) => {return c.uuid}))
      if (
        isEqual(
          ComponentTreeHelpers.mapComponentTreeParentsFirst(
            updatedComponentTree,
            (c) => c.uuid
          ),
          ComponentTreeHelpers.mapComponentTreeParentsFirst(componentTree, (c) => c.uuid)
        )
      ) {
        return;
      }
      // this works because the last selected component must be the highest in depth
      // and the first selected component is the furthest away
      const lowestParentUUID = ComponentTreeHelpers.getLowestParentUUID(
        selectedComponentUUIDs.at(0),
        selectedComponentUUIDs.at(-1),
        componentTree
      );
      const selectedComponents = componentTree
        .filter((c) => selectedComponentUUIDs.includes(c.uuid))
        .map((c) => {
          if (c.parentUUID !== lowestParentUUID) return c;
          return updateComponentParentUUID(c, destinationParentId);
        });

        updatedComponentTree = updatedComponentTree.filter(
        (c) =>
          c.uuid === dragSourceId || !selectedComponentUUIDs.includes(c.uuid)
      );
      let newDestinationIndex;
      updatedComponentTree.forEach((c, index) => {
        if (c.uuid === dragSourceId) {
          newDestinationIndex = index;
        }
      });
      updatedComponentTree.splice(
        newDestinationIndex,
        1,
        ...selectedComponents
      );

      updateComponentTree(updatedComponentTree);
    },
    [selectedComponentUUIDs, componentTree, updateComponentTree]
  );

  const handleDrop = useCallback(
    (tree: NodeModel<ComponentState>[], options) => {
      const { dragSourceId, destinationIndex } = options;
      const updatedComponentTree: ComponentState[] =
        convertNodeModelsToComponentTree(tree);
      if (selectedComponentUUIDs.includes(dragSourceId)) {
        const destinationParentId = tree[destinationIndex].parent.toString();
        handleSelectedDrop(
          updatedComponentTree,
          dragSourceId,
          destinationParentId
        );
      } else {
        updateComponentTree(updatedComponentTree);
      }
    },
    [handleSelectedDrop, selectedComponentUUIDs, updateComponentTree]
  );

  return handleDrop;
}

function convertNodeModelsToComponentTree(tree: NodeModel<ComponentState>[]) {
  const updatedComponentTree: ComponentState[] = tree.map((n) => {
    if (!n.data) {
      throw new Error(
        "Unable to handle drag and drop event in ComponentTree: " +
          "No data passed into NodeModel<ComponentState> for node " +
          JSON.stringify(n, null, 2)
      );
    }
    return updateComponentParentUUID(n.data, n.parent.toString());
  });
  return updatedComponentTree;
}

function updateComponentParentUUID(
  componentState: ComponentState,
  newParentUUID: string
) {
  const updatedComponentState: ComponentState = {
    ...componentState,
    parentUUID: newParentUUID,
  };
  if (updatedComponentState.parentUUID === ROOT_ID) {
    delete updatedComponentState.parentUUID;
  }
  return updatedComponentState;
}
