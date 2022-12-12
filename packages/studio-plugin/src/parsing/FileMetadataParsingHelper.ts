import { PropShape } from "../types/PropShape";
import { PropValueKind, PropValues } from "../types/PropValues";
import StudioSourceFile from "./StudioSourceFile";
import TypeGuards from "./TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";

/**
 * FileMetadataParsingHelpers is a static class for housing shared parsing logic for
 * files of type FileMetadata (e.g. Module or Component) within Studio.
 */
export default class FileMetadataParsingHelpers {

  /**
   * Get initial props for a component, defined through a const variable "initialProps"
   * that match the interface `${componentName}Props`.
   *
   * @param studioSourceFile - StudioSourceFile instance for a component source file
   * @param componentName - Name of component exported in file
   * @param propShape - Shape of the component's props
   * @returns field values for "initialProps" variable in file
   */
  static getInitialProps(
    studioSourceFile: StudioSourceFile,
    componentName: string,
    propShape: PropShape
    ): PropValues | undefined {
    const rawValues = studioSourceFile.parseExportedObjectLiteral("initialProps");
    if (!rawValues) {
      return undefined;
    }
    const propValues: PropValues = {};
    Object.keys(rawValues).forEach((propName) => {
      const { value, isExpression } = rawValues[propName];
      if (isExpression) {
        throw new Error(
          `Expressions are not supported within initialProps for ${componentName}.`
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
   * @param studioSourceFile - StudioSourceFile instance for a component source file
   * @param componentName - Name of component exported in file
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns shape of the component's props
   */
  static getPropShape(
    studioSourceFile: StudioSourceFile,
    componentName: string,
    onProp?: (propName: string) => boolean
  ): PropShape {
    const propsInterface = studioSourceFile.parseInterface(
      `${componentName}Props`
    );
    const studioImports =
    studioSourceFile.parseNamedImports()[STUDIO_PACKAGE_NAME] ?? [];
    const propShape: PropShape = {};
    Object.keys(propsInterface).forEach((propName) => {
      const { type, doc } = propsInterface[propName];
      if(onProp && !onProp(propName)) {
        return;
      } 
  
      if (!TypeGuards.isPropValueType(type)) {
        throw new Error(
          `Unrecognized prop type ${type} in props interface for ${componentName}.`
        );
      }
      if (!TypeGuards.isPrimitiveProp(type) && !studioImports.includes(type)) {
        throw new Error(
          `Missing import from ${STUDIO_PACKAGE_NAME} for ${type} in props interface for ${componentName}.`
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
