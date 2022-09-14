import { Classes, DndProvider, DragItem, DropOptions, getBackendOptions, MultiBackend, NodeModel, RenderParams, Tree } from '@minoru/react-dnd-treeview'
import classNames from 'classnames'
import { isEqual } from 'lodash'
import { useCallback, useMemo, useRef, useState } from 'react'
import { ComponentState, PageState } from '../../shared/models'
import CustomContextMenu from './CustomContextMenu'
import getComponentStateOrThrow from './getComponentStateOrThrow'
import { useStudioContext } from './useStudioContext'

const ROOT_ID = 'tree-root-uuid'
const CSS_CLASSES: Readonly<Classes> = {
  container: 'm-2',
  placeholder: 'relative',
  listItem: 'relative',
  dropTarget: 'bg-lime-100'
}

type ValidatedNodeList = (NodeModel<ComponentState> & {
  parent: string,
  data: ComponentState
})[]
type NodeList = NodeModel<ComponentState>[]
 
export default function ComponentTree() {
  const { pageState, setPageState } = useStudioContext()
  const [ tree, setTree ] = useState(() => pageState.componentsState.map(c => ({
    id: c.uuid,
    parent: c.parentUUID ?? ROOT_ID,
    text: c.name,
    droppable: true,
    data: c
  })))
  console.log(JSON.stringify(tree, null, 2))

  const handleDrop = useCallback((tree: NodeList) => {
    console.log(tree)
    validateTreeOrThrow(tree)
    // setPageState({
    //   ...pageState,
    //   componentsState: tree.map(n => ({
    //     ...n.data,
    //     ...n.parent && { parentUUID: n.parent}
    //   }))
    // })
    setTree(tree)
  }, [pageState, setPageState])

  return (
    <DndProvider backend={MultiBackend} options={getBackendOptions()}>
      <Tree
        tree={tree}
        rootId={ROOT_ID}
        canDrop={() => true}
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
        // classes={CSS_CLASSES}
        // placeholderRender={(_, { depth }) => {
        //   return (
        //     <div style={{ left: `${depth}em`, backgroundColor: 'red', position: 'absolute', width: '100%', height: '2px' }}></div>
        //   )
        // }}
        sort={false}
        insertDroppableFirst={false}
        dropTargetOffset={10}
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
  return <ComponentNode componentState={node.data} {...params}/>
}

interface ComponentNodeProps extends RenderParams {
  componentState: ComponentState
}

function ComponentNode(props: ComponentNodeProps) {
  const {
    componentState,
    hasChild,
    onToggle,
    isOpen,
    depth
  } = props

  const ref = useRef<HTMLDivElement>(null)
  const {
    activeComponentUUID,
    setActiveComponentUUID,
    pageStateOnFile,
    moduleNameToComponentMetadata
  } = useStudioContext()

  const updateActiveComponent = useCallback(() => {
    if (activeComponentUUID !== componentState.uuid) {
      setActiveComponentUUID(componentState.uuid)
    } else {
      setActiveComponentUUID(undefined)
    }
  }, [activeComponentUUID, componentState.uuid, setActiveComponentUUID])

  const className = classNames('flex border-solid border-2 ', {
    'border-indigo-600': activeComponentUUID === componentState.uuid,
    'border-transparent': activeComponentUUID !== componentState.uuid
  })

  const isGlobal = moduleNameToComponentMetadata.localComponents[componentState.name].global

  return (
    <div
      key={componentState.uuid}
      className='flex cursor-grab select-none p-2'
      style={{ marginLeft: `${depth}em` }}
    >
      <div
        className={className}
        ref={ref}
        onClick={updateActiveComponent}
      >
        {!isGlobal && <CustomContextMenu elementRef={ref} componentUUID={componentState.uuid} />}
        {componentState.name} {componentState.uuid.substring(0, 3)}
        {hasUnsavedChanges(componentState, pageStateOnFile) && <div className='red'>*</div>}
      </div>
      {hasChild && <div className='cursor-pointer' onClick={onToggle}>&nbsp;{isOpen ? '[-]' : '[+]'}</div>}
    </div>
  )
}

function hasUnsavedChanges(componentState: ComponentState, pageStateOnFile: PageState) {
  const initialComponentState: ComponentState =
    getComponentStateOrThrow(componentState.uuid, pageStateOnFile.componentsState)
  return !isEqual(componentState.props, initialComponentState?.props)
}
