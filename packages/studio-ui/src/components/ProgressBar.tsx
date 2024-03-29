import { CSSProperties, memo, useMemo } from "react";

export default memo(ProgressBar);

function ProgressBar(props: { progressFraction: number }) {
  const progressStyles: CSSProperties = useMemo(() => {
    return {
      width: `${Math.floor(props.progressFraction * 20) * 5}%`,
      transition: "width 1s",
    };
  }, [props.progressFraction]);

  return (
    <div className="w-9/12 bg-indigo-200 h-8 rounded items-center flex">
      <div
        className="bg-indigo-400 h-full rounded-l animate-pulse"
        style={progressStyles}
      ></div>
    </div>
  );
}
