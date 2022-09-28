import ComponentTree from './ComponentTree';
import { useActiveComponentStateOrThrow } from './getComponentState';
import { useStudioContext } from './useStudioContext';

export default function SymbolEditor() {
  const { symbolNameToMetadata } = useStudioContext()
  const activeComponentState = useActiveComponentStateOrThrow()
  if (!activeComponentState) {
    return null
  }

  const tree = symbolNameToMetadata[`${activeComponentState.name}.symbol.tsx`]?.content ?? []

  return (
    <div>
      symbol editor
      <ComponentTree
        componentsState={tree}
        setComponentsState={() => console.log('setting sub state')}
      />
    </div>
  )
}