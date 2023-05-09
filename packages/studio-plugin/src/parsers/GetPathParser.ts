import {
  SyntaxKind,
  Block,
  FunctionDeclaration,
  ArrowFunction,
  StringLiteral,
  Node,
} from "ts-morph";
import StaticParsingHelpers from "./helpers/StaticParsingHelpers";
import StudioSourceFileParser from "./StudioSourceFileParser";
import { GET_PATH_FUNCTION_NAME } from "../constants";

/**
 * GetPathParser is a class for parsing the getPath function in a PageFile.
 */
export default class GetPathParser {
  constructor(private studioSourceFileParser: StudioSourceFileParser) {}

  /**
   * Gets the return value of the getPath function if one is defined, and if
   * there is a single, top-level, string literal value returned from it.
   */
  parseGetPathValue(): string | undefined {
    const returnStringLiteral = this.getReturnStringLiteral();
    return returnStringLiteral?.getLiteralText();
  }

  /**
   * If a getPath function is defined and a single, top-level, string literal
   * is returned from it, returns that string literal. If a getPath function is
   * not defined, an error is thrown.
   */
  getReturnStringLiteral(): StringLiteral | undefined {
    const getPathFunction = this.findGetPathFunction();
    if (!getPathFunction) {
      throw new Error(
        "Error parsing getPath value: no getPath function found."
      );
    }
    if (getPathFunction.isKind(SyntaxKind.FunctionDeclaration)) {
      const block = getPathFunction.getFirstChildByKind(SyntaxKind.Block);
      return block && this.handleBlock(block);
    }
    const body = getPathFunction.getLastChild();
    if (!body) {
      return;
    }
    if (body.isKind(SyntaxKind.Block)) {
      return this.handleBlock(body);
    }
    return this.getStringLiteral(body);
  }

  /**
   * Returns the getPath function if one is defined.
   */
  findGetPathFunction(): FunctionDeclaration | ArrowFunction | undefined {
    return this.studioSourceFileParser.getFunctionNode(GET_PATH_FUNCTION_NAME);
  }

  private handleBlock(block: Block): StringLiteral | undefined {
    const returnStatements = block.getChildrenOfKind(
      SyntaxKind.ReturnStatement
    );
    if (returnStatements.length > 0) {
      const returnStatement = returnStatements[0];
      const returnValue = returnStatement.getChildAtIndex(1);
      return this.getStringLiteral(returnValue);
    }
  }

  private getStringLiteral(node: Node): StringLiteral | undefined {
    if (node.isKind(SyntaxKind.StringLiteral)) {
      return node;
    }
    if (node.isKind(SyntaxKind.ParenthesizedExpression)) {
      const unwrappedExp = StaticParsingHelpers.unwrapParensExpression(node);
      return unwrappedExp.getFirstChildByKind(SyntaxKind.StringLiteral);
    }
  }
}
