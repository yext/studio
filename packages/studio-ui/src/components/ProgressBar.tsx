import { CSSProperties, memo, useMemo } from "react";

export default memo(ProgressBar);

function ProgressBar(props: { progressFraction: number }) {
  const progressStyles: CSSProperties = useMemo(() => {
    return {
      width: `${Math.ceil(props.progressFraction * 100)}%`,
      transition: `width ${Math.floor(2 - props.progressFraction)}s ease-out`,
    };
  }, [props.progressFraction]);

  return (
    <div className="w-9/12 bg-indigo-200 h-8 rounded items-center flex">
      <div
        className="bg-indigo-400 h-full rounded-l"
        style={progressStyles}
      ></div>
    </div>
  );
}
