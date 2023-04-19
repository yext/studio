import { ParameterDeclaration, SyntaxKind } from "ts-morph";
import StudioSourceFileParser from "./StudioSourceFileParser";

export default class PropInterfaceNameParser {
  constructor(private sourceFileParser: StudioSourceFileParser) {}

  /**
   * Parses the interface name for the component's props.
   */
  parsePropInterfaceName(): string | undefined {
    const defaultExport =
      this.sourceFileParser.getDefaultExportReactComponent();
    if (!defaultExport?.isKind(SyntaxKind.FunctionDeclaration)) {
      throw new Error(
        "Expected a function for component at: " +
          this.sourceFileParser.getFilepath()
      );
    }
    const parameters: ParameterDeclaration[] = defaultExport.getParameters();
    if (parameters.length > 1) {
      throw new Error(
        "Function components may contain at most one parameter, found " +
          `${parameters.length} at ${this.sourceFileParser.getFilepath()}`
      );
    }

    const firstParam = parameters[0];
    if (!firstParam) {
      return;
    }

    return firstParam.getTypeNodeOrThrow().getText();
  }
}
