import { PropsWithChildren, ReactNode } from 'react';
import classNames from 'classnames';

const TRANSITION_CLASSES = 'transition-opacity duration-500';

export default function LoadingOverlay(props: PropsWithChildren<{
  loading: boolean,
  overlay: ReactNode
}>) {
  const { loading, overlay } = props;

  const childrenWrapperClassname = classNames(TRANSITION_CLASSES, {
    'opacity-100': !loading,
    'opacity-0 invisible': loading
  })

  const overlayClassname = classNames(TRANSITION_CLASSES, 'h-full w-full fixed flex justify-center items-center flex-col', {
    'opacity-100': loading,
    'opacity-0': !loading
  });

  return (
    <>
      <div className={overlayClassname}>
        {overlay}
      </div>
      <div className={childrenWrapperClassname}>{props.children}</div>
    </>
  )
}
