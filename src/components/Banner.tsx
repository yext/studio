export interface BannerProps {
  title?: string, // this is the title for doing things blahblah
  randomNum?: number,
  someBool?: boolean,
}

export default function Banner(props: BannerProps) {
  const className = `w-fill p-3 flex flex-col items-center bg-lime-300 border-b-2 border-black`;
  return (
    <div className={className}>
      <h1 className='text-3xl p-1'>
        {props.title || 'Default Title'}
      </h1>
    </div>
  );
}
