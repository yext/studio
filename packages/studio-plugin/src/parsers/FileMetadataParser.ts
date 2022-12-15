import { PropShape } from "../types/PropShape";
import { PropValues } from "../types/PropValues";
import PropValuesParser from "./PropValuesParser";
import PropShapeParser from "./PropShapeParser";
import { FileMetadata } from "../types";
import StudioSourceFileParser from "./StudioSourceFileParser";

/**
 * FileMetadataParser is a class for housing shared parsing logic for
 * files of type FileMetadata (e.g. Module or Component) within Studio.
 */
export default class FileMetadataParser {
  private propValuesParser: PropValuesParser;
  private propShapeParser: PropShapeParser;

  constructor(
    private componentName: string,
    studioSourceFileParser: StudioSourceFileParser
  ) {
    this.propValuesParser = new PropValuesParser(studioSourceFileParser);
    this.propShapeParser = new PropShapeParser(studioSourceFileParser);
  }

  /**
   * Parses the propShape and initialProps used in FileMetadata.
   *
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns the propShape and initialProps
   */
  parse(
    onProp?: (propName: string) => boolean
  ): Pick<FileMetadata, "initialProps" | "propShape"> {
    const propShape = this.parsePropShape(onProp);
    const initialProps = this.parseInitialProps(propShape);
    return {
      propShape,
      ...(initialProps && { initialProps }),
    };
  }

  /**
   * Get initial props for a component, defined through a const variable "initialProps"
   * that match the interface `${componentName}Props`.
   *
   * @param propShape - Shape of the component's props
   * @returns field values for "initialProps" variable in file
   */
  private parseInitialProps(propShape: PropShape): PropValues | undefined {
    return this.propValuesParser.parsePropValues(propShape, "initialProps");
  }

  /**
   * Get shape of the component's props, defined through an interface `${componentName}Props`.
   *
   * @param onProp - A function to execute when iterating through each field in the prop interface
   * @returns shape of the component's props
   */
  private parsePropShape(onProp?: (propName: string) => boolean): PropShape {
    return this.propShapeParser.parsePropShape(
      `${this.componentName}Props`,
      onProp
    );
  }
}
