import StudioSourceFile from "./StudioSourceFile";
import path from "path";
import {
  ComponentMetadata,
  FileMetadataKind,
  PropShape,
  PropValueKind,
  PropValues,
  SpecialReactProps,
} from "../types";
import TypeGuards from "./TypeGuards";
import { STUDIO_PACKAGE_NAME } from "../constants";

/**
 * ComponentFile is responsible for parsing a single component file, for example
 * `src/components/Banner.tsx`.
 */
export default class ComponentFile {
  private studioSourceFile: StudioSourceFile;
  private componentName: string;

  constructor(filepath: string) {
    this.componentName = path.basename(filepath, ".tsx");
    this.studioSourceFile = new StudioSourceFile(filepath);
  }

  private getInitialProps(propShape: PropShape): PropValues | undefined {
    const rawValues =
      this.studioSourceFile.parseExportedObjectLiteral("initialProps");
    if (!rawValues) {
      return undefined;
    }
    const propValues: PropValues = {};
    Object.keys(rawValues).forEach((propName) => {
      const { value, isExpression } = rawValues[propName];
      const propValue = {
        valueType: propShape[propName].type,
        kind: isExpression ? PropValueKind.Expression : PropValueKind.Literal,
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

  getComponentMetadata(): ComponentMetadata {
    const propsInterface = this.studioSourceFile.parseInterface(
      `${this.componentName}Props`
    );
    const studioImports =
      this.studioSourceFile.parseNamedImports()[STUDIO_PACKAGE_NAME] ?? [];
    const propShape: PropShape = {};
    let acceptsChildren = false;

    Object.keys(propsInterface).forEach((propName) => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
        return;
      }
      const { type, doc } = propsInterface[propName];
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

    const initialProps = this.getInitialProps(propShape);
    return {
      kind: FileMetadataKind.Component,
      propShape,
      ...(initialProps && { initialProps }),
      ...(acceptsChildren ? { acceptsChildren } : {}),
    };
  }
}
