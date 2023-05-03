import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeLiteralNode,
  TypeAliasDeclaration,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";
import { TypeGuards } from "../../utils";
import StringUnionParsingHelper from "./StringUnionParsingHelper";

export type ParsedType =
  | SimpleParsedType
  | ObjectParsedType
  | StringLiteralType;

export type SimpleParsedType = {
  kind: ParsedTypeKind.Simple;
  type: string;
  unionValues?: string[];
};

type ObjectParsedType = {
  kind: ParsedTypeKind.Object;
  type: ParsedShape;
  unionValues?: never;
};

type StringLiteralType = {
  kind: ParsedTypeKind.StringLiteral;
  type: string;
  unionValues?: never;
};

export type ParsedShape = { [key: string]: ParsedProperty };

export type ParsedProperty = ParsedType & {
  doc?: string;
  required: boolean;
};

export enum ParsedTypeKind {
  Simple = "simple",
  Object = "object",
  StringLiteral = "stringLiteral",
}

export default class TypeNodeParsingHelper {
  static parseShape(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
    const parsedType = this.parseTypeNode(shapeNode, parseTypeReference);
    return parsedType;
  }

  private static parseTypeNode(
    typeNode: InterfaceDeclaration | TypeAliasDeclaration | PropertySignature,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
    if (typeNode.isKind(SyntaxKind.InterfaceDeclaration)) {
      return this.handleObjectType(typeNode, parseTypeReference);
    }

    const typeLiteral = typeNode.getFirstChildByKind(SyntaxKind.TypeLiteral);
    if (typeLiteral) {
      return this.handleObjectType(typeLiteral, parseTypeReference);
    }

    const literalType = typeNode.getFirstChildByKind(SyntaxKind.LiteralType);
    if (literalType) {
      const literal = literalType.getLiteral();
      if (!literal.isKind(SyntaxKind.StringLiteral)) {
        throw new Error(
          `Only string literals are supported within type nodes. Found ${literalType.getText()}`
        );
      }
      return {
        kind: ParsedTypeKind.StringLiteral,
        type: literal.getLiteralValue(),
      };
    }

    const name = StaticParsingHelpers.getEscapedName(typeNode);
    const unionType = typeNode.getFirstChildByKind(SyntaxKind.UnionType);
    if (unionType) {
      const unionValues = StringUnionParsingHelper.parseStringUnion(
        unionType,
        name,
        parseTypeReference
      );
      return {
        kind: ParsedTypeKind.Simple,
        type: PropValueType.string,
        unionValues,
      };
    }

    const type = typeNode.getStructure().type?.toString();
    if (!type) {
      throw new Error(
        `Unable to parse ${name} in node: ${typeNode.getFullText()}`
      );
    }
    if (!TypeGuards.isPropValueType(type)) {
      const externalParsedType = parseTypeReference(type);
      if (externalParsedType) {
        return externalParsedType;
      }
    }

    return {
      kind: ParsedTypeKind.Simple,
      type,
    };
  }

  private static handleObjectType(
    shapeDeclaration: InterfaceDeclaration | TypeLiteralNode,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ObjectParsedType {
    const properties = shapeDeclaration.getProperties();
    const parsedShape: ParsedShape = {};

    properties.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      const parsedType = this.parseTypeNode(p, parseTypeReference);
      const doc = this.getJsDocs(p);
      parsedShape[propertyName] = {
        ...parsedType,
        required: !p.hasQuestionToken(),
        ...(doc && { doc }),
      };
    });
    return {
      kind: ParsedTypeKind.Object,
      type: parsedShape,
    };
  }

  private static getJsDocs(propertySignature: PropertySignature) {
    const docs = propertySignature.getStructure().docs;
    return docs
      ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
      .join("\n");
  }
}
