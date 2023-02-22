import cx from "classnames";

type Props = {
  //Insert Props Here
  className?: string;
  children: React.ReactNode;
};

const Callout = ({ className, children }: Props) => {
  return (
    <div
      className={cx(
        className,
        "text-sm bg-gray-100 p-4 border text-gray-500 rounded-lg text-center"
      )}
    >
      {children}
    </div>
  );
};

export default Callout;
