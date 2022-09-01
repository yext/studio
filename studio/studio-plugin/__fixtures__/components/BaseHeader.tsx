import { HexColor } from '../../../types'

export interface BaseHeaderProps {
  /** this is prop1 */
  prop1?: HexColor,
  /** this is prop2 */
  prop2?: number
}

export const initialProps: BaseHeaderProps = {
  prop1: '#ffff00',
  prop2: 100,
}

export default function BaseHeader(props: BaseHeaderProps) {
  return <div>{props.prop1}, {props.prop2}</div>
}
