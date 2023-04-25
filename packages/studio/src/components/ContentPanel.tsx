import {
  PropValueKind,
  PropMetadata,
  PropValueType,
  ComponentStateHelpers,
} from "@yext/studio-plugin";
import Divider from "./common/Divider";
import PropEditors from "./PropEditors";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import RepeaterEditor from "./RepeaterEditor";
import useStudioStore from "../store/useStudioStore";
import filterEntityData from "../utils/filterEntityData";

/**
 * Renders prop editors for the active component selected by the user.
 *
 * Filters by {@link PropValueType} to only render strings.
 *
 * Interprets all prop values as {@link PropValueKind.Expression}s, even if
 * the value could be represented by a string literal.
 */
export default function ContentPanel(): JSX.Element | null {
  const hasArrayEntityData = useStudioStore((store) => {
    const filteredData = filterEntityData(
      "array",
      store.pages.activeEntityData
    );
    return Object.keys(filteredData).length > 0;
  });

  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const { activeComponentState, propShape } = activeComponentWithProps;

  return (
    <div>
      <PropEditors
        activeComponentState={ComponentStateHelpers.extractStandardOrModuleComponentState(
          activeComponentState
        )}
        propShape={propShape}
        getPropValueKind={getPropValueKind}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
      {/** TODO: remove hasArrayEntityData check once other arrays are supported. */}
      {hasArrayEntityData && (
        <>
          <RepeaterEditor componentState={activeComponentState} />
          <Divider />
        </>
      )}
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type === PropValueType.string;
}

export function getPropValueKind(metadata: PropMetadata): PropValueKind {
  return Object.hasOwn(metadata, "unionValues")
    ? PropValueKind.Literal
    : PropValueKind.Expression;
}
