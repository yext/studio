import { CSSProperties } from 'react'
import kgLogoUrl from '../images/kg-logo.jpeg'

export function KGLogo({ style }: { style?: CSSProperties }): JSX.Element {
  return <img
    src={kgLogoUrl}
    alt='this input uses streams'
    className='h-8'
    style={style}
  />
}
