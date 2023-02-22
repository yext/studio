import cx from "classnames";
import React from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const Label = ({ className, children }: Props) => {
  return <div className={cx(className, "font-semibold")}>{children}</div>;
};

export default Label;
