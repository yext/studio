import { UnionTypeNode, SyntaxKind, LiteralTypeNode } from "ts-morph";
import { ParsedType, ParsedTypeKind } from "./TypeNodeParsingHelper";

export default class StringUnionParsingHelper {
  static parseStringUnion(
    unionType: UnionTypeNode,
    name: string,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): string[] {
    return unionType.getTypeNodes().flatMap((n) => {
      if (n.isKind(SyntaxKind.LiteralType)) {
        return this.handleLiteralType(n, name);
      } else if (n.isKind(SyntaxKind.TypeReference)) {
        const identifier = n.getText();
        const parsedType = parseTypeReference(identifier);
        if (
          parsedType?.kind !== ParsedTypeKind.Simple ||
          parsedType.unionValues === undefined
        ) {
          throw new Error(
            `Expected a union value for "${name}", received ${JSON.stringify(
              parsedType,
              null,
              2
            )}`
          );
        }
        return parsedType.unionValues;
      }
      throw new Error(
        `Unexpected node kind ${n.getKindName()} while parsing string union "${name}".`
      );
    });
  }

  private static handleLiteralType(node: LiteralTypeNode, name: string) {
    const firstChild = node.getFirstChildOrThrow();
    if (!firstChild.isKind(SyntaxKind.StringLiteral)) {
      throw new Error(
        `Union types only support strings. Found a ${firstChild?.getKindName()} ` +
          `within "${name}".`
      );
    }
    return firstChild.getLiteralText();
  }
}
