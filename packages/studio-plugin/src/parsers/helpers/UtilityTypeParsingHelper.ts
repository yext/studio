import { TypeNode, TypeReferenceNode } from "ts-morph";
import { ParsedType, ParsedTypeKind } from "./TypeNodeParsingHelper";

export default class UtilityTypeParsingHelper {
  static parseUtilityType(
    typeRefNode: TypeReferenceNode,
    parseTypeNode: (node: TypeNode) => ParsedType
  ): ParsedType | undefined {
    const typeName = typeRefNode.getTypeName().getText();
    const typeArgs = typeRefNode.getTypeArguments();

    if (typeName === "Omit") {
      return this.handleOmit(typeArgs, parseTypeNode);
    }
  }

  private static handleOmit(
    typeArgs: TypeNode[],
    parseTypeNode: (node: TypeNode) => ParsedType
  ): ParsedType {
    if (typeArgs.length !== 2) {
      throw new Error(
        `Two type params expected for Omit utility type. Found ${typeArgs.length}.`
      );
    }

    const [fullType, omitType] = typeArgs.map(parseTypeNode);

    if (fullType.kind !== ParsedTypeKind.Object) {
      return fullType;
    }
    if (omitType.kind === ParsedTypeKind.StringLiteral) {
      delete fullType.type[omitType.type];
      return fullType;
    } else if (omitType.unionValues) {
      omitType.unionValues.forEach((key) => delete fullType.type[key]);
      return fullType;
    } else {
      throw new Error(
        "Expected string literal or union of string literals for second type arg of Omit utility type." +
          ` Found ${omitType}.`
      );
    }
  }
}
