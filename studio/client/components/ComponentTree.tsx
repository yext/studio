import { Classes, DndProvider, DragItem, DragLayerMonitorProps, DropOptions, getBackendOptions, MultiBackend, NodeModel, RenderParams, Tree, PlaceholderRenderParams } from '@minoru/react-dnd-treeview'
import { ReactElement, useCallback, useMemo } from 'react'
import { ComponentState, JsxElementState } from '../../shared/models'
import ComponentNode from './ComponentNode'
import { StudioContextType, useStudioContext } from './useStudioContext'

const ROOT_ID = 'tree-root-uuid'
const CSS_CLASSES: Readonly<Classes> = {
  root: 'p-4',
  placeholder: 'relative',
  listItem: 'relative'
}

type Node = NodeModel<JsxElementState>
type ValidatedNodeList = (Node & {
  parent: string,
  data: JsxElementState
})[]

export default function ComponentTree(props: {
  componentsState: JsxElementState[],
  setComponentsState: (c: JsxElementState[]) => void
}) {
  const { componentsState, setComponentsState } = props;
  const tree: Node[] = useMemo(() => {
    return componentsState.map(c => ({
      id: c.uuid,
      parent: c.parentUUID ?? ROOT_ID,
      text: c.name,
      droppable: true,
      data: c
    }))
  }, [componentsState])

  const handleDrop = useCallback((tree: Node[]) => {
    validateTreeOrThrow(tree)
    const updatedTree = tree.map(n => {
      const componentState: JsxElementState = {
        ...n.data,
        parentUUID: n.parent
      }
      if (componentState.parentUUID === ROOT_ID) {
        delete componentState.parentUUID
      }
      return componentState
    })
    setComponentsState(updatedTree)
  }, [componentsState, setComponentsState])

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
  )
}

function canDrop(_: Node[], opts: DropOptions<JsxElementState>) {
  const { dragSource, dropTargetId } = opts
  if (dragSource?.parent === dropTargetId || dropTargetId === ROOT_ID) {
    return true
  }
  // For this drag and drop library, returning undefined has different behavior than returning false.
  // It means to use the default behavior.
  return undefined
}

function renderNode(node: Node, params: RenderParams) {
  if (!node.data) {
    throw new Error('Node must have data')
  }
  return (
    <ComponentNode
      componentState={node.data}
      depth={params.depth}
      isOpen={params.isOpen}
      hasChild={params.hasChild}
      onToggle={params.onToggle}
      isDropTarget={params.isDropTarget}
    />
  )
}

function renderDragPreview(monitorProps: DragLayerMonitorProps<JsxElementState>) {
  const item: DragItem<unknown> = monitorProps.item
  return (
    <div style={{ backgroundColor: 'aliceblue', borderRadius: '4px', padding: '4px 8px' }}>
      <div className='flex'>{item.text}</div>
    </div>
  )
}

function renderPlaceholder(
  _: Node,
  { depth }: PlaceholderRenderParams
): ReactElement {
  return (
    <div style={{
      left: `${depth}em`,
      backgroundColor: 'red',
      position: 'absolute',
      width: '100%',
      height: '2px'
    }}></div>
  )
}

function validateTreeOrThrow(tree: Node[]): asserts tree is ValidatedNodeList {
  if (tree.some(n => !n.data)) {
    throw new Error('Missing JsxElementState data in ComponentTree')
  }
  if (tree.some(n => typeof n.parent !== 'string')) {
    throw new Error('node.parent must be a string')
  }
}
