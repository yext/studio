import ComponentTree from './ComponentTree'
import { useStudioContext } from './useStudioContext'

export default function SymbolEditor() {
  const { setActiveComponentUUID, setActiveSymbolName } = useStudioContext()
  return (
    <div>
      symbol editor
      <button className='btn' onClick={() => {
        setActiveComponentUUID(undefined)
        setActiveSymbolName(undefined)
      }}>return to full component tree</button>
      <ComponentTree />
    </div>
  )
}