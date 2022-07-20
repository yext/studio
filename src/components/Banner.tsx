import { HexColor } from "../../studio/types";

export interface BannerProps {
  /** Banner title! */
  title?: string,
  /** 
   * Some random
   * number to display!
   */
  randomNum?: number,
  /**
   * A boolean to toggle nothing..
   */
  someBool?: boolean,
  /** Make it colorful */
  backgroundColor?: HexColor
}

export const initialProps: BannerProps = {
  randomNum: 42
}

export default function Banner(props: BannerProps) {
  const className = `w-fill p-3 flex flex-col items-center border-b-2 border-black`;
  return (
    <div className={className} style={{'backgroundColor': `${props.backgroundColor ?? '#ffffff'}`}}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
      {props.randomNum && <h2>{props.randomNum}</h2>}
      <h3>{props.someBool ? 'true' : 'false'}</h3>
    </div>
  );
}
