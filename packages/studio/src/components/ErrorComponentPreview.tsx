import { ErrorComponentState } from "@yext/studio-plugin"
import { CSSProperties, useMemo } from "react"
import { v4 } from 'uuid'
import ErrorBoundary from "./common/ErrorBoundary"
import { Tooltip } from "react-tooltip"

const errorStyles: CSSProperties = {
  border: 'solid rgb(234, 140, 192) 1px',
  boxShadow: '-1px 1px 2px rgb(234, 140, 192)'
};

export default function ErrorComponentPreview(props: {
  errorComponentState: ErrorComponentState,
  element: JSX.Element | null
}) {
  const { errorComponentState, element } = props
  const uniqueId = useMemo(() => v4(), [])
  // We cannot use the uuid on ErrorComponentState due to
  // repeaters re-using the same uuid
  const anchorId = `ErrorComponentState-${uniqueId}`

  return (
    <div id={anchorId} style={errorStyles}>
      <ErrorBoundary customError={errorComponentState.message}>
        {element}
      </ErrorBoundary>
      <Tooltip content={errorComponentState.message} anchorId={anchorId}/>
    </div>
  )
}