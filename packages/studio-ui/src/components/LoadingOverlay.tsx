import { PropsWithChildren, ReactNode } from "react";
import classNames from "classnames";

export default function LoadingOverlay(
  props: PropsWithChildren<{
    loading: boolean;
    overlay: ReactNode;
  }>
) {
  const { loading, overlay } = props;

  const childrenWrapperClassname = classNames(
    "transition-opacity duration-500",
    {
      "opacity-100": !loading,
      "opacity-0 pointer-events-none": loading,
    }
  );

  const overlayClassname = classNames(
    "transition-opacity duration-500",
    "h-full w-full flex absolute justify-center items-center flex-col",
    {
      "opacity-100": loading,
      "opacity-0 pointer-events-none": !loading,
    }
  );

  return (
    <>
      <div className={overlayClassname} data-testid="loading-overlay">
        {overlay}
      </div>
      <div className={childrenWrapperClassname}>{props.children}</div>
    </>
  );
}
