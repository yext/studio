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
}

export default function Banner(props: BannerProps) {
  const className = `w-fill p-3 flex flex-col items-center bg-lime-300 border-b-2 border-black`;
  return (
    <div className={className}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
      {props.randomNum && <h2>{props.randomNum}</h2>}
      <h3>{props.someBool ? 'true' : 'false'}</h3>
    </div>
  );
}
