import { PropShape } from "../types/PropShape";
import { PropValueKind, PropValues } from "../types/PropValues";
import StudioSourceFile from "./StudioSourceFile";
import TypeGuards from "./TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";

/**
 * FileMetadataParsingHelper is a class for housing shared parsing logic for
 * files of type FileMetadata (e.g. Module or Component) within Studio.
 */
export default class FileMetadataParsingHelper {
  constructor(
    private componentName: string,
    private studioSourceFile: StudioSourceFile
  ) {}

  /**
   * Get initial props for a component, defined through a const variable "initialProps"
   * that match the interface `${componentName}Props`.
   *
   * @param propShape - Shape of the component's props
   * @returns field values for "initialProps" variable in file
   */
  getInitialProps(propShape: PropShape): PropValues | undefined {
    const rawValues =
      this.studioSourceFile.parseExportedObjectLiteral("initialProps");
    if (!rawValues) {
      return undefined;
    }
    const propValues: PropValues = {};
    Object.keys(rawValues).forEach((propName) => {
      const { value, isExpression } = rawValues[propName];
      if (isExpression) {
        throw new Error(
          `Expressions are not supported within initialProps for ${this.componentName}.`
        );
      }
      const propValue = {
        valueType: propShape[propName].type,
        kind: PropValueKind.Literal,
        value,
      };
      if (!TypeGuards.isValidPropValue(propValue)) {
        throw new Error(
          "Invalid prop value: " + JSON.stringify(propValue, null, 2)
        );
      }
      propValues[propName] = propValue;
    });
    return propValues;
  }

  /**
   * Get shape of the component's props, defined through an interface `${componentName}Props`.
   *
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns shape of the component's props
   */
  getPropShape(onProp?: (propName: string) => boolean): PropShape {
    const propsInterface = this.studioSourceFile.parseInterface(
      `${this.componentName}Props`
    );
    const studioImports =
      this.studioSourceFile.parseNamedImports()[STUDIO_PACKAGE_NAME] ?? [];
    const propShape: PropShape = {};
    Object.keys(propsInterface).forEach((propName) => {
      const { type, doc } = propsInterface[propName];
      if (onProp && !onProp(propName)) {
        return;
      }

      if (!TypeGuards.isPropValueType(type)) {
        throw new Error(
          `Unrecognized prop type ${type} in props interface for ${this.componentName}.`
        );
      }
      if (!TypeGuards.isPrimitiveProp(type) && !studioImports.includes(type)) {
        throw new Error(
          `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in props interface for ${this.componentName}.`
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
