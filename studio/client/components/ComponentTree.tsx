import { Classes, DndProvider, DragItem, getBackendOptions, MultiBackend, NodeModel, RenderParams, Tree } from '@minoru/react-dnd-treeview'
import { useCallback, useMemo } from 'react'
import { ComponentState } from '../../shared/models'
import ComponentNode from './ComponentNode'
import { useStudioContext } from './useStudioContext'

const ROOT_ID = 'tree-root-uuid'
const CSS_CLASSES: Readonly<Classes> = {
  root: 'p-4',
  placeholder: 'relative',
  listItem: 'relative'
}

type ValidatedNodeList = (NodeModel<ComponentState> & {
  parent: string,
  data: ComponentState
})[]
type NodeList = NodeModel<ComponentState>[]

export default function ComponentTree() {
  const { pageState, setPageState } = useStudioContext()

  const tree = useMemo(() => {
    return pageState.componentsState.map(c => ({
      id: c.uuid,
      parent: c.parentUUID ?? ROOT_ID,
      text: c.name,
      droppable: true,
      data: c
    }))
  }, [pageState.componentsState])

  const handleDrop = useCallback((tree: NodeList) => {
    validateTreeOrThrow(tree)
    setPageState({
      ...pageState,
      componentsState: tree.map(n => ({
        ...n.data,
        ...(n.parent && n.parent !== ROOT_ID && { parentUUID: n.parent })
      }))
    })
  }, [pageState, setPageState])

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={tree}
        rootId={ROOT_ID}
        canDrop={(_, { dragSource, dropTargetId }) => {
          if (dragSource?.parent === dropTargetId) {
            return true
          }
          // There is currently a bug in @minoru/react-dnd-treeview where you have to return undefined,
          // instead of false, to get the expected behavior
          return undefined
        }}
        onDrop={handleDrop}
        render={renderNode}
        dragPreviewRender={monitorProps => {
          const item: DragItem<unknown> = monitorProps.item
          return (
            <div style={{ backgroundColor: 'aliceblue', borderRadius: '4px', padding: '4px 8px' }}>
              <div className='flex'>{item.text}</div>
            </div>
          )
        }}
        classes={CSS_CLASSES}
        placeholderRender={(_, { depth }) => {
          return (
            <div style={{ left: `${depth}em`, backgroundColor: 'red', position: 'absolute', width: '100%', height: '2px' }}></div>
          )
        }}
        sort={false}
        insertDroppableFirst={false}
        dropTargetOffset={15}
        initialOpen={true}
      />
    </DndProvider>
  )
}

function validateTreeOrThrow(tree: NodeList): asserts tree is ValidatedNodeList {
  if (tree.some(n => !n.data)) {
    throw new Error('Missing ComponentState data in ComponentTree')
  }
  if (tree.some(n => typeof n.parent !== 'string')) {
    throw new Error('node.parent must be a string')
  }
}

function renderNode(node: NodeModel<ComponentState>, params: RenderParams) {
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
