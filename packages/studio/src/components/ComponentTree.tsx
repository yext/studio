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
import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { useCallback, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import ComponentNode from "./ComponentNode";

const ROOT_ID = "tree-root-uuid";
const TREE_CSS_CLASSES: Readonly<Classes> = {
  root: "p-4",
  placeholder: "relative",
  listItem: "relative",
};

export default function ComponentTree() {
  const tree: NodeModel<ComponentState>[] | undefined = useTree();
  const handleDrop = useDropHandler();

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
        initialOpen={true}
        sort={false}
        insertDroppableFirst={false}
        onDrop={handleDrop}
        canDrop={canDrop}
        render={renderNode}
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

function renderNode(
  node: NodeModel<ComponentState>,
  { depth, isOpen, onToggle, hasChild }: RenderParams
) {
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
}

function renderDragPreview(
  monitorProps: DragLayerMonitorProps<ComponentState>
) {
  const item: DragItem<unknown> = monitorProps.item;
  return (
    <div className="p-2 rounded bg-emerald-200">
      <div className="flex">{item.text}</div>
    </div>
  );
}

function renderPlaceholder(_: NodeModel, { depth }: PlaceholderRenderParams) {
  return (
    <div
      className="bg-rose-500 absolute w-full h-0.5"
      style={{ left: `${depth}em` }}
    ></div>
  );
}

function useTree(): NodeModel<ComponentState>[] | undefined {
  const activePageState = useStudioStore((store) =>
    store.pages.getActivePageState()
  );

  const getComponentMetadata = useStudioStore(
    (store) => store.fileMetadatas.getComponentMetadata
  );

  const tree = useMemo(() => {
    if (!activePageState) {
      return undefined;
    }

    return activePageState.componentTree.map((componentState) => {
      const commonData = {
        id: componentState.uuid,
        parent: componentState.parentUUID ?? ROOT_ID,
        data: componentState,
        text: "",
      };
      switch (componentState.kind) {
        case ComponentStateKind.Fragment:
        case ComponentStateKind.BuiltIn:
          return {
            ...commonData,
            droppable: true,
          };
        case ComponentStateKind.Module:
          return {
            ...commonData,
            droppable: false,
          };
        case ComponentStateKind.Standard:
          const metadata = getComponentMetadata(componentState.metadataUUID);

          return {
            ...commonData,
            droppable: metadata.acceptsChildren,
          };
        default:
          throw new Error(
            `Unhandled ComponentStateKind ${componentState["kind"]}`
          );
      }
    });
  }, [activePageState, getComponentMetadata]);

  return tree;
}

function useDropHandler() {
  const activePageState = useStudioStore((store) =>
    store.pages.getActivePageState()
  );

  const setComponentTree = useStudioStore((store) => {
    return (componentTree: ComponentState[]) => {
      if (!activePageState) {
        return;
      }
      store.pages.setActivePageState({
        ...activePageState,
        componentTree,
      });
    };
  });

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
      setComponentTree(updatedComponentTree);
    },
    [setComponentTree]
  );
  return handleDrop;
}
