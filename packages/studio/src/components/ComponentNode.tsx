import { ComponentState, ComponentStateKind } from '@yext/studio-plugin'
import { ReactComponent as Vector } from '../icons/vector.svg'
import { ReactComponent as Hexagon } from '../icons/hexagon.svg'
import { ReactComponent as Box } from '../icons/box.svg'
import { ReactComponent as Container } from '../icons/container.svg'
import classNames from 'classnames'
import useStudioStore from '../store/useStudioStore'

export default function ComponentNode(props: {
  componentState: ComponentState,
  depth: number,
  isOpen: boolean,
  onToggle: () => void,
  hasChild: boolean
}) {
  const { componentState, depth, isOpen, onToggle, hasChild } = props;
  const text = 'componentName' in componentState ? componentState.componentName : 'Fragment';
  const vectorClassName = classNames('cursor-pointer', {
    'rotate-90': isOpen,
  })

  return (
    <div className='flex items-center' style={{ marginLeft: `${depth}em` }}>
      {hasChild && <Vector className={vectorClassName} onClick={onToggle}/>}
      <ComponentKindIcon componentState={componentState}/>
      <span className='pl-1.5'>{text}</span>
    </div>
  )
}

function ComponentKindIcon({ componentState }: {
  componentState: ComponentState,
}) {
  const getComponentMetadata = useStudioStore(store => store.fileMetadatas.getComponentMetadata)

  const { kind } = componentState;
  if (kind === ComponentStateKind.Module) {
    return <Hexagon/>
  }
  if (kind !== ComponentStateKind.Standard) {
    return null
  }

  const { acceptsChildren } = getComponentMetadata(componentState.metadataUUID)
  if (acceptsChildren) {
    return <Container/>
  }
  return <Box/>;
}