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
    "transition-opacity duration-500 delay-100",
    {
      "opacity-100": !loading,
      "opacity-0 invisible": loading,
    }
  );

  const overlayClassname = classNames(
    "transition-opacity duration-500 delay-100",
    "h-full w-full fixed flex justify-center items-center flex-col",
    {
      "opacity-100": loading,
      "opacity-0": !loading,
    }
  );

  return (
    <>
      <div className={overlayClassname}>{overlay}</div>
      <div className={childrenWrapperClassname}>{props.children}</div>
    </>
  );
}
