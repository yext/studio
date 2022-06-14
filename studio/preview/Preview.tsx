export interface PreviewProps {
  children: React.ReactChild
}

export function Preview (props: PreviewProps) {
  return (
    <div className='w-full h-full'>
      {props.children}
    </div>
  );
}