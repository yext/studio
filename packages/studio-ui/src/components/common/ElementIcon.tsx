import { ReactComponent as Component } from "../../icons/square-solid.svg";
import { ReactComponent as Container } from "../../icons/square-empty.svg";
import { ReactComponent as Layout } from "../../icons/mosaic.svg";

export enum ElementType {
  Components = "Components",
  Containers = "Containers",
  Layouts = "Layouts",
}

interface ElementIconProps {
  type: ElementType;
}

/**
 * Returns the Icon that represents the provided Element Type.
 */
export default function ElementIcon(props: ElementIconProps) {
  switch (props.type) {
    case ElementType.Components:
      return <Component />;
    case ElementType.Containers:
      return <Container />;
    case ElementType.Layouts:
      return <Layout />;
    default:
      console.error(`Could not find Icon for type ${props.type}`);
      return null;
  }
}
