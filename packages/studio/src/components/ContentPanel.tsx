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

/**
 * Renders prop editors for the active component selected by the user.
 *
 * Filters by {@link PropValueType} to only render strings.
 *
 * Interprets all prop values as {@link PropValueKind.Expression}s, even if
 * the value could be represented by a string literal.
 */
export default function ContentPanel(): JSX.Element | null {
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
      <RepeaterEditor componentState={activeComponentState} />
      <Divider />
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
