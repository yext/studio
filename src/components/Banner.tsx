import { HexColor, StreamsTemplateString, StreamsDataPath } from "../../studio/types";

export interface BannerProps {
  /** Banner title! */
  title?: string,
  /** A title that takes in streams data */
  subtitleUsingStreams?: StreamsTemplateString,
  /** 
   * Some random
   * number to display!
   */
  randomNum?: StreamsDataPath,
  /**
   * A boolean to toggle nothing..
   */
  someBool?: boolean,
  /** Make it colorful */
  backgroundColor?: HexColor,
  anotherColor?: HexColor
}

export const initialProps: BannerProps = {
  title: '<Insert Title Here>'
}

export default function Banner(props: BannerProps) {
  const className = `w-fill p-3 flex flex-col items-center border-b-2 border-black`;
  return (
    <div className={className} style={{'backgroundColor': `${props.backgroundColor ?? '#ffffff'}`}}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
      <h3>{props.subtitleUsingStreams}</h3>
      {props.randomNum && <h2>{props.randomNum}</h2>}
      <h3>{props.someBool ? 'true' : 'false'}</h3>
    </div>
  );
}
