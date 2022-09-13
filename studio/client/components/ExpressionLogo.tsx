import { CSSProperties } from 'react'
import expressionLogoUrl from '../images/pages-logo.jpg'

export function ExpressionLogo({ style }: { style?: CSSProperties }): JSX.Element {
  return <img
    src={expressionLogoUrl}
    alt='this input is of type Expression'
    className='h-8'
    style={style}
  />
}
