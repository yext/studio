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
      this.studioSourceFile.parseImports()["@yext/studio"] ?? [];
    const propShape: PropShape = {};
    let acceptsChildren = false;

    Object.keys(propsInterface).forEach((propName) => {
      if (propName === SpecialReactProps.Children) {
        acceptsChildren = true;
        return;
      }
      const { type, doc } = propsInterface[propName];
      if (!TypeGuards.isPropValueType(type)) {
        console.error(
          "Unrecognized prop type",
          type,
          "in props interface for",
          this.componentName
        );
        return;
      }
      if (!TypeGuards.isPrimitiveProp(type) && !studioImports.includes(type)) {
        console.error(
          "Missing import for",
          type,
          "in props interface for",
          this.componentName
        );
        return;
      }
      propShape[propName] = { type };
      if (doc) {
        propShape[propName].doc = doc;
      }
    });

    const initialProps = this.getInitialProps(propShape);
    const componentMetadata: ComponentMetadata = {
      kind: FileMetadataKind.Component,
      propShape,
    };
    initialProps && (componentMetadata.initialProps = initialProps);
    acceptsChildren && (componentMetadata.acceptsChildren = acceptsChildren);
    return componentMetadata;
  }
}
