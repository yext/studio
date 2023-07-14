import { isEqual } from "lodash";
import { Component, PropsWithChildren, ReactInstance } from "react";
import { findDOMNode } from "react-dom";
import DOMRectProperties from "../store/models/DOMRectProperties";
import useStudioStore from "../store/useStudioStore";
import rectToJson from "../utils/rectToJson";

/**
 * HighlightingContainer is intended to be used as a wrapper around a
 * single rendered Studio component.
 *
 * When this container is clicked, it sets it's child component as the
 * current active component, and adds highlighting styling around it.
 */
export default function HighlightingContainer(
  props: PropsWithChildren<{ uuid: string }>
) {
  const [setActiveUUID, setRect, rect, activeComponentUUID] = useStudioStore(
    (store) => [
      store.pages.setActiveComponentUUID,
      store.pages.setActiveComponentRect,
      store.pages.activeComponentRect,
      store.pages.activeComponentUUID,
    ]
  );

  return (
    <HighlightingClass
      uuid={props.uuid}
      setRect={setRect}
      setActiveUUID={setActiveUUID}
      activeComponentUUID={activeComponentUUID}
      rect={rect}
    >
      {props.children}
    </HighlightingClass>
  );
}

type HighlightingProps = PropsWithChildren<{
  uuid: string;
  activeComponentUUID?: string;
  setActiveUUID: (uuid: string) => void;
  setRect: (rect: DOMRectProperties) => void;
  rect?: DOMRectProperties;
}>;

class HighlightingClass extends Component<HighlightingProps> {
  private resizeObserver: ResizeObserver;

  constructor(props: HighlightingProps) {
    super(props);
    this.resizeObserver = new ResizeObserver(() => {
      if (this.props.uuid === this.props.activeComponentUUID) {
        this.highlightSelf();
      }
    });
  }

  highlightSelf = (e?: Event) => {
    e?.stopImmediatePropagation();
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    const rect = rectToJson(childNode.getBoundingClientRect());
    if (!isEqual(this.props.rect, rect)) {
      this.props.setRect(rect);
    }
    if (this.props.activeComponentUUID !== this.props.uuid) {
      this.props.setActiveUUID(this.props.uuid);
    }
  };

  private attachListenerToChild() {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.addEventListener("click", this.highlightSelf);
    this.resizeObserver.observe(document.body);
  }

  componentDidUpdate(): void {
    this.attachListenerToChild();
    if (this.props.uuid === this.props.activeComponentUUID) {
      this.highlightSelf();
    }
  }

  componentWillUnmount(): void {
    const childNode = getDOMNode(this);
    if (!childNode) {
      return;
    }
    childNode.removeEventListener("click", this.highlightSelf);
    this.resizeObserver.disconnect();
  }

  render() {
    return <>{this.props.children}</>;
  }
}

function getDOMNode(instance: ReactInstance): Element | null {
  const childNode = findDOMNode(instance);
  if (!childNode || childNode instanceof Text) {
    return null
  }
  return childNode;
}