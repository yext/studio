import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  UnionTypeNode,
  TypeLiteralNode,
  TypeAliasDeclaration,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";
import { TypeGuards } from "../../utils";

export type ParsedType = SimpleParsedType | ObjectParsedType;

type SimpleParsedType = {
  kind: ParsedTypeKind.Simple;
  type: string;
  unionValues?: string[];
};

type ObjectParsedType = {
  kind: ParsedTypeKind.Object;
  type: ParsedShape;
  unionValues?: never;
};

export type ParsedShape = { [key: string]: ParsedType & ParsedProperty };

export type ParsedProperty = ParsedType & PropertyMetadata;

type PropertyMetadata = {
  doc?: string;
  required: boolean;
};

export enum ParsedTypeKind {
  Simple = "simple",
  Object = "object",
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

    const name = StaticParsingHelpers.getEscapedName(typeNode);
    const unionType = typeNode.getFirstChildByKind(SyntaxKind.UnionType);
    if (unionType) {
      return this.handleUnionType(unionType, name);
    }

    const type = typeNode.getStructure().type?.toString();
    if (!type) {
      throw new Error(
        `Unable to parse ${name} in node: ${typeNode.getFullText()}`
      );
    }
    if (!TypeGuards.isPropValueType(type)) {
      const externalShape = parseTypeReference(type);
      if (externalShape) {
        return externalShape;
      }
    }

    return {
      kind: ParsedTypeKind.Simple,
      type,
    };
  }

  private static toParsedProperty(
    parsedType: ParsedType,
    required: boolean,
    doc?: string
  ): ParsedProperty {
    const { type, unionValues } = parsedType;
    return typeof type === "string"
      ? {
          kind: ParsedTypeKind.Simple,
          type,
          unionValues,
          required,
          ...(doc && { doc }),
        }
      : {
          kind: ParsedTypeKind.Object,
          type,
          required,
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
      parsedShape[propertyName] = this.toParsedProperty(
        parsedType,
        !p.hasQuestionToken(),
        this.getJsDocs(p)
      );
    });
    return {
      kind: ParsedTypeKind.Object,
      type: parsedShape,
    };
  }

  private static handleUnionType(
    unionType: UnionTypeNode,
    name: string
  ): SimpleParsedType {
    const unionValues = unionType.getTypeNodes().map((n) => {
      const firstChild = n.getFirstChild();
      if (!firstChild?.isKind(SyntaxKind.StringLiteral)) {
        throw new Error(
          `Union types only support strings. Found a ${firstChild?.getKindName()} ` +
            `within "${name}".`
        );
      }
      return firstChild.getLiteralText();
    });

    return {
      kind: ParsedTypeKind.Simple,
      type: PropValueType.string,
      unionValues,
    };
  }

  private static getJsDocs(propertySignature: PropertySignature) {
    const docs = propertySignature.getStructure().docs;
    return docs
      ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
      .join("\n");
  }
}
