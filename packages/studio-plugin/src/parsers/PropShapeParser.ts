import { PropShape } from "../types/PropShape";
import StudioSourceFile from "../sourcefiles/StudioSourceFile";
import TypeGuards from "../parsers/helpers/TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";

/**
 * PropShapeParser is a class for parsing a typescript interface into a PropShape.
 */
export default class PropShapeParser {
  constructor(private studioSourceFile: StudioSourceFile) {}

  /**
   * Get shape of the component's props, defined through an interface `${componentName}Props`.
   *
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns shape of the component's props
   */
  parsePropShape(
    interfaceName: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const propsInterface = this.studioSourceFile.parseInterface(interfaceName);
    const studioImports =
      this.studioSourceFile.parseNamedImports()[STUDIO_PACKAGE_NAME] ?? [];
    if (!propsInterface) {
      return {};
    }
    const propShape: PropShape = {};
    Object.keys(propsInterface).forEach((propName) => {
      const { type, doc } = propsInterface[propName];
      if (onProp && !onProp(propName)) {
        return;
      }

      if (!TypeGuards.isPropValueType(type)) {
        throw new Error(
          `Unrecognized type ${type} in interface ${interfaceName}`
        );
      }
      if (!TypeGuards.isPrimitiveProp(type) && !studioImports.includes(type)) {
        throw new Error(
          `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in interface for ${interfaceName}.`
        );
      }
      propShape[propName] = { type };
      if (doc) {
        propShape[propName].doc = doc;
      }
    });
    return propShape;
  }
}
