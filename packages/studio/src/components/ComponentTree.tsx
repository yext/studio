import {
  Classes,
  DndProvider,
  DragItem,
  DragLayerMonitorProps,
  DropOptions,
  getBackendOptions,
  MultiBackend,
  NodeModel,
  PlaceholderRenderParams,
  RenderParams,
  Tree,
} from "@minoru/react-dnd-treeview";
import { ComponentState, TypeGuards } from "@yext/studio-plugin";
import { useCallback, useMemo, useState } from "react";
import { getComponentDisplayName } from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";
import ComponentNode from "./ComponentNode";

const ROOT_ID = "tree-root-uuid";
const TREE_CSS_CLASSES: Readonly<Classes> = {
  root: "py-2",
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

function canDrop(_: NodeModel[], opts: DropOptions) {
  const { dragSource, dropTargetId, dropTarget } = opts;
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

function renderDragPreview(
  monitorProps: DragLayerMonitorProps<ComponentState>
) {
  const item: DragItem<unknown> = monitorProps.item;
  return (
    <div className="p-2 rounded bg-emerald-200 w-fit">
      <div className="flex">{item.text}</div>
    </div>
  );
}

function renderPlaceholder(_: NodeModel, { depth }: PlaceholderRenderParams) {
  const Placeholder = () => {
    const placeHolderStyle = useMemo(() => ({ left: `${depth}em` }), []);
    return (
      <div
        className="bg-rose-500 absolute w-full h-0.5 z-10"
        style={placeHolderStyle}
      ></div>
    );
  };
  return <Placeholder />;
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
  const updateComponentTree = useStudioStore(
    (store) => store.actions.updateComponentTree
  );

  const handleDrop = useCallback(
    (tree: NodeModel<ComponentState>[]) => {
      const updatedComponentTree = tree.map((n) => {
        if (!n.data) {
          throw new Error(
            "Unable to handle drag and drop event in ComponentTree: " +
              "No data passed into NodeModel<ComponentState> for node " +
              JSON.stringify(n, null, 2)
          );
        }
        const componentState: ComponentState = {
          ...n.data,
          parentUUID: n.parent.toString(),
        };
        if (componentState.parentUUID === ROOT_ID) {
          delete componentState.parentUUID;
        }
        return componentState;
      });
      updateComponentTree(updatedComponentTree);
    },
    [updateComponentTree]
  );
  return handleDrop;
}
