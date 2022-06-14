export interface StudioProps {
  children: React.ReactChild
}

export function Studio (props: StudioProps) {
  return (
    <div className='h-screen w-screen flex flex-row'>
      {props.children}
    </div>
  );
}