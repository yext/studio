import { PropsWithChildren } from 'react';

export default function TestLayout(props: PropsWithChildren<{}>) {
  return (
    <div>
        <p className='text-white bg-violet-600 text-center'>This is a Test Layout!</p>
        {props.children}
    </div>
  )
}