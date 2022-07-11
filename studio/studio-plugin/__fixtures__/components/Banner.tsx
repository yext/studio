import { ColorProp } from './SpecialProps';

export interface BannerProps {
  title?: string, // this is the title for doing things blahblah
  randomNum?: number,
  someBool?: boolean,
  backgroundColor?: ColorProp
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
  );
}
