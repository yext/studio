import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { ReactComponent as Vector } from "../icons/vector.svg";
import classNames from "classnames";
import ComponentKindIcon from "./ComponentKindIcon";

/**
 * ComponentNode is a single node in {@link ComponentTree}.
 */
export default function ComponentNode(props: {
  /** The ComponentState this node represents in {@link ComponentTree} */
  componentState: ComponentState;
  /** The depth of this node inside ComponentTree */
  depth: number;
  /** Whether this node's children are visible, if it has children. */
  isOpen: boolean;
  /** Toggle callback to open/close the node. */
  onToggle: () => void;
  /** Whether this node has children. */
  hasChild: boolean;
}) {
  const { componentState, depth, isOpen, onToggle, hasChild } = props;

  const text =
    componentState.kind === ComponentStateKind.Fragment
      ? "Fragmnet"
      : componentState.componentName;

  const vectorClassName = classNames("cursor-pointer", {
    "rotate-90": isOpen,
    invisible: !hasChild,
  });

  return (
    <div className="flex items-center h-8" style={{ marginLeft: `${depth}em` }}>
      <Vector className={vectorClassName} onClick={onToggle} />
      <div className="pl-1.5">
        <ComponentKindIcon componentState={componentState} />
      </div>
      <span className="pl-1.5">{text}</span>
    </div>
  );
}
