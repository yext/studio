import {
  ComponentState,
  ComponentStateHelpers,
  ComponentStateKind,
} from "@yext/studio-plugin";
import { ReactComponent as Vector } from "../icons/vector.svg";
import classNames from "classnames";
import ComponentKindIcon from "./ComponentKindIcon";
import { useCallback, useMemo, KeyboardEvent } from "react";
import useStudioStore from "../store/useStudioStore";
import RemoveElementButton from "./RemoveElementButton";
import { getComponentDisplayName } from "../hooks/useActiveComponentName";
import { Tooltip } from "react-tooltip";

interface ComponentNodeProps {
  /** The ComponentState this node represents in a ComponentTree. */
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
 * ComponentNode is a single node in a ComponentTree;
 */
export default function ComponentNode(props: ComponentNodeProps): JSX.Element {
  const { componentState, depth, isOpen, onToggle, hasChild } = props;
  const [
    activeComponentUUID,
    selectedComponentUUIDs,
    setActiveComponentUUID,
    addSelectedComponentUUID,
    clearSelectedComponents,
    addShiftSelectedComponentUUIDs,
  ] = useStudioStore((store) => {
    return [
      store.pages.activeComponentUUID,
      store.pages.selectedComponentUUIDs,
      store.pages.setActiveComponentUUID,
      store.pages.addSelectedComponentUUID,
      store.pages.clearSelectedComponents,
      store.pages.addShiftSelectedComponentUUIDs,
    ];
  });

  const isActiveComponent = activeComponentUUID === componentState.uuid;
  const isSelectedComponent = selectedComponentUUIDs.includes(
    componentState.uuid
  );

  const vectorClassName = classNames("cursor-pointer", {
    "rotate-90": isOpen,
    invisible: !hasChild,
  });

  const handleClick = useCallback(
    (event) => {
      if (event.shiftKey && activeComponentUUID) {
        clearSelectedComponents();
        addShiftSelectedComponentUUIDs(componentState);
      } else {
        clearSelectedComponents();
        setActiveComponentUUID(componentState.uuid);
        addSelectedComponentUUID(componentState.uuid);
      }
    },
    [
      activeComponentUUID,
      componentState,
      setActiveComponentUUID,
      addSelectedComponentUUID,
      clearSelectedComponents,
      addShiftSelectedComponentUUIDs,
    ]
  );

  const componentNodeStyle = useMemo(
    () => ({ paddingLeft: `${depth}em` }),
    [depth]
  );
  const extractedState =
    ComponentStateHelpers.extractRepeatedState(componentState);
  const isErrorState = extractedState.kind === ComponentStateKind.Error;
  const componentNodeClasses = classNames(
    "flex pr-4 items-center justify-between h-9",
    {
      "bg-blue-100": isActiveComponent || isSelectedComponent,
      "hover:bg-gray-100": !isActiveComponent && !isSelectedComponent,
      "text-red-500": isErrorState,
    }
  );
  const anchorId = `ComponentNode-${componentState.uuid}`;

  const handleToggle = useCallback(() => {
    onToggle(componentState.uuid, !isOpen);
  }, [componentState.uuid, isOpen, onToggle]);

  const handleKeyDown = useDeleteKeyListener(isSelectedComponent);

  return (
    <div className={componentNodeClasses} style={componentNodeStyle}>
      <div
        className="flex grow items-center cursor-pointer"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        id={anchorId}
      >
        <Vector className={vectorClassName} onClick={handleToggle} />
        <div className="pl-2">
          <ComponentKindIcon componentState={componentState} />
        </div>
        <span className="pl-1.5">
          {getComponentDisplayName(componentState)}
        </span>
        {isErrorState && (
          <Tooltip
            content={extractedState.message}
            anchorId={anchorId}
            place="right"
            positionStrategy="fixed"
            className="z-20"
          />
        )}
      </div>
      {isActiveComponent && (
        <RemoveElementButton elementUUID={componentState.uuid} />
      )}
    </div>
  );
}

function useDeleteKeyListener(isSelectedComponent: boolean) {
  const [removeComponent, selectedComponentUUIDs, clearSelectedComponents] =
    useStudioStore((store) => {
      return [
        store.actions.removeComponent,
        store.pages.selectedComponentUUIDs,
        store.pages.clearSelectedComponents,
      ];
    });
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isSelectedComponent && event.key === "Backspace") {
        selectedComponentUUIDs.map((uuid) => removeComponent(uuid));
        clearSelectedComponents();
      }
    },
    [
      isSelectedComponent,
      removeComponent,
      selectedComponentUUIDs,
      clearSelectedComponents,
    ]
  );
}
