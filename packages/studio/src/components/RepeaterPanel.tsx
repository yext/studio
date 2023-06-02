import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import useStudioStore from "../store/useStudioStore";
import filterEntityData from "../utils/filterEntityData";
import Divider from "./common/Divider";
import RepeaterEditor from "./RepeaterEditor";

export default function RepeaterPanel() {
  const hasArrayEntityData = useStudioStore((store) => {
    const filteredData = filterEntityData(
      "array",
      store.pages.activeEntityData
    );
    return Object.keys(filteredData).length > 0;
  });

  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps || !hasArrayEntityData) {
    return null;
  }

  const { activeComponentState } = activeComponentWithProps;
  return (
    <div className="mt-6">
      <Divider />
      <RepeaterEditor componentState={activeComponentState} />
    </div>
  );
}
