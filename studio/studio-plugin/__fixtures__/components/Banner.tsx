import { ColorProp } from './SpecialProps'
import { HexColor } from '../../../types'

export interface BannerProps {
  title?: string, // this is trailing comment
  /** jsdoc single line */
  randomNum?: number,
  /**
   * this is a jsdoc
   * multi-line comments!
   */
  someBool?: boolean,
  fakeColor?: ColorProp,
  // this is a leading comment
  backgroundColor?: HexColor
}

export const defaultClassNames = 'w-fill p-3 flex flex-col items-center bg-lime-300 border-b-2 border-black'

export default function Banner(props: BannerProps) {
  return (
    <div className={defaultClassNames} style={{ backgroundColor: props.backgroundColor }}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
      {props.randomNum && <h2>{props.randomNum}</h2>}
      <h3>{props.someBool ? 'true' : 'false'}</h3>
    </div>
  )
}
