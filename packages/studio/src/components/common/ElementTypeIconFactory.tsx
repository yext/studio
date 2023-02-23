import { ReactComponent as Hexagon } from "../../icons/hexagon.svg";
import { ReactComponent as Box } from "../../icons/box.svg";
import { ReactComponent as Container } from "../../icons/container.svg";
import { ElementType } from "../AddElementMenu/AddElementMenu";

/**
 * Returns the Icon that represents the provided Element Type.
 */
export default function renderIconForType(type: ElementType) {
  switch (type) {
    case ElementType.Components:
      return <Box />;
    case ElementType.Containers:
      return <Container />;
    case ElementType.Modules:
      return <Hexagon />;
    default:
      console.error(`Could not find Icon for type ${type}`);
      return null;
  }
}
