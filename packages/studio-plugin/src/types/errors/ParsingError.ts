export enum ParsingErrorType {
  InvalidComponentSignature = "InvalidComponentSignature",
  InvalidComponentPropModel = "InvalidComponentPropModel",
  MissingTopLevelJSXNode = "MissingTopLevelJSXNode",
}

/**
 * Errors that occur during parsing.
 */
export interface ParsingError {
  name: ParsingErrorType;
  message: string;
}
