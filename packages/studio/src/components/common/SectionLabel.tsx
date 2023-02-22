import cx from "classnames";
import React from "react";

type Props = {
  className?: string;
  children?: React.ReactNode;
};

const SectionLabel = ({ className, children }: Props) => {
  return <div className={cx(className, "font-semibold")}>{children}</div>;
};

export default SectionLabel;
