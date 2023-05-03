import { SyntaxKind, ParameterDeclaration } from "ts-morph";
import { Result, Maybe } from "true-myth";
import StudioSourceFileParser from "./StudioSourceFileParser";
import TsMorphHelpers from "./helpers/TsMorphHelpers";
import { ParsingError, ParsingErrorType } from "../types/errors/ParsingError";

export default class ComponentParamParser {
  constructor(private sourceFileParser: StudioSourceFileParser) {}

  /**
   * Parses the interface name for the component's props.
   */
  parseParamName(): Result<Maybe<string>, ParsingError> {
    const parameters = this.getParameters();
    if (parameters.length > 1) {
      return Result.err({
        name: ParsingErrorType.InvalidComponentSignature,
        message:
          "Functional components may contain at most one parameter, found " +
          `${parameters.length} at ${this.sourceFileParser.getFilepath()}`,
      });
    }

    const firstParam = parameters[0];
    if (!firstParam) {
      return Result.ok(Maybe.nothing());
    }

    const getNameResult = this.getNameFromDeclaration(firstParam);
    return getNameResult.isOk
      ? Result.ok(Maybe.of(getNameResult.value))
      : Result.err(getNameResult.error);
  }

  private getParameters() {
    const defaultExport =
      this.sourceFileParser.getDefaultExportReactComponent();
    if (defaultExport.isKind(SyntaxKind.VariableDeclaration)) {
      const functionNode = TsMorphHelpers.getFirstChildOfKindOrThrow(
        defaultExport,
        SyntaxKind.ArrowFunction,
        SyntaxKind.FunctionExpression
      );
      return functionNode.getParameters();
    }
    return defaultExport.getParameters();
  }

  private getNameFromDeclaration(
    decl: ParameterDeclaration
  ): Result<string, ParsingError> {
    try {
      const name = decl.getTypeNodeOrThrow().getText();
      return Result.ok(name);
    } catch (err) {
      return Result.err({
        ...(err as Error),
        name: ParsingErrorType.ComponentPropParsingFailure,
        message: `Failed to parse Component Prop in ${this.sourceFileParser.getFilepath()}`,
      });
    }
  }
}
