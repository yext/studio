export enum ParsingErrorType {
  MissingTopLevelJSXNode,
  ComponentPropParsingFailure,
  InvalidComponentSignature,
}

/**
 * An interface representing errors that occur during the parsing of Components,
 * their Prop interfaces, or Component Trees.
 */
export interface ParsingError {
  type: ParsingErrorType;
  message: string;
}
