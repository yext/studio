import cx from "classnames";

type Props = {
  //Insert Props Here
  className?: string;
  children: string;
};

const InputLabel = ({ className, children }: Props) => {
  // Turn children from camelCase into Title Case
  const titleCase = (str: string) => {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <span className={cx("block text-sm font-medium text-gray-700", className)}>
      {titleCase(children)}
    </span>
  );
};

export default InputLabel;
