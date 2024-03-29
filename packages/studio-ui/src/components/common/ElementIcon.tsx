import { ReactComponent as Component } from "../../icons/square-solid.svg";
import { ReactComponent as Container } from "../../icons/square-empty.svg";
import { ReactComponent as Layout } from "../../icons/mosaic.svg";
import { ComponentMetadata } from "@yext/studio-plugin";

export enum ElementType {
  Components = "Components",
  Containers = "Containers",
  Layouts = "Layouts",
}

interface ElementIconProps {
  elementType: ElementType;
}

/**
 * Returns the Icon that represents the provided Element Type.
 */
export default function ElementIcon(props: ElementIconProps) {
  switch (props.elementType) {
    case ElementType.Components:
      return <Component />;
    case ElementType.Containers:
      return <Container />;
    case ElementType.Layouts:
      return <Layout />;
    default:
      console.error(`Could not find Icon for type ${props.elementType}`);
      return null;
  }
}

export function getElementType(metadata: ComponentMetadata): ElementType {
  if (metadata.acceptsChildren) {
    return ElementType.Containers;
  }
  return ElementType.Components;
}
