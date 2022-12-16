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
  Tree,
} from "@minoru/react-dnd-treeview";
import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { useCallback, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";

const ROOT_ID = "tree-root-uuid";
const CSS_CLASSES: Readonly<Classes> = {
  root: "p-4",
  placeholder: "relative",
  listItem: "relative",
};
export default function ComponentTree() {
  const activePageState = useStudioStore((store) =>
    store.pages.getActivePageState()
  );
  const getComponentMetadata = useStudioStore(
    (store) => store.fileMetadatas.getComponentMetadata
  );
  const setComponentTree = useStudioStore((store) => {
    return (componentTree: ComponentState[]) => {
      store.pages.setActivePageState({
        ...store.pages.getActivePageState(),
        componentTree,
      });
    };
  });

  const tree = useMemo(() => {
    return activePageState.componentTree.map((c) => {
      const commonData = {
        id: c.uuid,
        text:
          c.kind === ComponentStateKind.Fragment ? "Fragment" : c.componentName,
        parent: c.parentUUID ?? ROOT_ID,
        data: c,
      };
      if (
        c.kind === ComponentStateKind.Fragment ||
        c.kind === ComponentStateKind.BuiltIn
      ) {
        return {
          ...commonData,
          droppable: true,
        };
      }
      if (c.kind === ComponentStateKind.Module) {
        return {
          ...commonData,
          droppable: false,
        };
      }
      const metadata = getComponentMetadata(c.metadataUUID);

      return {
        ...commonData,
        droppable: metadata.acceptsChildren,
      };
    });
  }, [activePageState, getComponentMetadata]);

  const handleDrop = useCallback(
    (tree: NodeModel<ComponentState>[]) => {
      const updatedComponentTree = tree.map((n) => {
        if (!n.data) {
          throw new Error("No data passed into NodeModel<ComponentState>");
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

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={tree}
        rootId={ROOT_ID}
        classes={CSS_CLASSES}
        dropTargetOffset={15}
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

function renderNode(node: NodeModel<ComponentState>) {
  return (
    <div>
      {node.text} {node.data?.uuid}
    </div>
  );
}

function renderDragPreview(
  monitorProps: DragLayerMonitorProps<ComponentState>
) {
  const item: DragItem<unknown> = monitorProps.item;
  return (
    <div
      style={{
        backgroundColor: "aliceblue",
        borderRadius: "4px",
        padding: "4px 8px",
      }}
    >
      <div className="flex">{item.text}</div>
    </div>
  );
}

function renderPlaceholder(_: NodeModel, { depth }: PlaceholderRenderParams) {
  return (
    <div
      style={{
        left: `${depth}em`,
        backgroundColor: "red",
        position: "absolute",
        width: "100%",
        height: "2px",
      }}
    ></div>
  );
}
