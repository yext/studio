import { ComponentState, ComponentStateKind } from "@yext/studio-plugin";
import { ReactComponent as Vector } from "../icons/vector.svg";
import classNames from "classnames";
import ComponentKindIcon from "./ComponentKindIcon";
import { useCallback, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import RemoveElementButton from "./RemoveElementButton";

interface ComponentNodeProps {
  /** The ComponentState this node represents in {@link ComponentTree}. */
  componentState: ComponentState;
  /** The depth of this node inside ComponentTree.*/
  depth: number;
  /** Whether this node's children are visible, if it has children. */
  isOpen: boolean;
  /** Toggle callback to open/close the node. */
  onToggle: (nodeId: string, newOpenValue: boolean) => void;
  /** Whether this node has children. */
  hasChild: boolean;
}

/**
 * ComponentNode is a single node in {@link ComponentTree}.
 */
export default function ComponentNode(props: ComponentNodeProps): JSX.Element {
  const { componentState, depth, isOpen, onToggle, hasChild } = props;
  const [activeComponentUUID, setActiveComponentUUID] = useStudioStore(
    (store) => {
      return [
        store.pages.activeComponentUUID,
        store.pages.setActiveComponentUUID,
      ];
    }
  );

  const text = (): string => {
    if (componentState.kind === ComponentStateKind.Fragment) {
      return "Fragment";
    }

    return componentState.componentName;
  };

  const isActiveComponent = (): boolean => activeComponentUUID === componentState.uuid;

  const vectorClassName = classNames("cursor-pointer", {
    "rotate-90": isOpen,
    invisible: !hasChild,
  });

  const handleClick = useCallback(() => {
    setActiveComponentUUID(componentState.uuid);
  }, [componentState.uuid, setActiveComponentUUID]);

  const componentNodeStyle = useMemo(
    () => ({ paddingLeft: `${depth}em` }),
    [depth]
  );

  const componentNodeClasses = classNames(
    "flex pr-4 items-center justify-between h-9",
    {
      "bg-blue-100": isActiveComponent(),
      "hover:bg-gray-100": activeComponentUUID !== componentState.uuid,
    }
  );

  const handleToggle = useCallback(() => {
    onToggle(componentState.uuid, !isOpen);
  }, [componentState.uuid, isOpen, onToggle]);

  return (
    <div className={componentNodeClasses} style={componentNodeStyle}>
      <div
        className="flex grow items-center cursor-pointer"
        onClick={handleClick}
      >
        <Vector className={vectorClassName} onClick={handleToggle} />
        <div className="pl-2">
          <ComponentKindIcon componentState={componentState} />
        </div>
        <span className="pl-1.5">{text()}</span>
      </div>
      {isActiveComponent() && (
        <RemoveElementButton elementUUID={componentState.uuid} />
      )}
    </div>
  );
}
