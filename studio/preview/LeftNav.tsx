export interface LeftNavProps {
  children: React.ReactChild
}

export function LeftNav(props: LeftNavProps) {
  return (
    <div className='h-screen w-64 bg-slate-500 flex flex-col'>
      <h1 className='text-3xl text-white'>Yext Studio</h1>
      {props.children}
    </div>
  );
}