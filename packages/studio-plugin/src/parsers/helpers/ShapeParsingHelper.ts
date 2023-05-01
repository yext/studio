import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  UnionTypeNode,
  TypeLiteralNode,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";
import { TypeGuards } from "../../utils";

export type ParsedShape = { [key: string]: ParsedProperty };
export type ParsedProperty = ParsedType & PropertyMetadata;
export type ParsedType = SimpleParsedType | ObjectParsedType;

type PropertyMetadata = {
  required: boolean;
  doc?: string;
};

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

export enum ParsedTypeKind {
  Simple = "simple",
  Object = "object",
}

export default class ShapeParsingHelper {
  static parseShape(
    shapeNode: InterfaceDeclaration | TypeLiteralNode,
    parseTypeReference: (identifier: string) => ParsedType
  ): ParsedShape {
    const properties = shapeNode.getProperties();
    const shape: ParsedShape = {};

    properties.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      const partiallyParsedProperty = this.parseProperty(p, parseTypeReference);
      const required = !p.hasQuestionToken();
      const doc = this.getJsDocs(p);
      shape[propertyName] = this.toParsedProperty(
        partiallyParsedProperty,
        required,
        doc
      );
    });
    return shape;
  }

  private static parseProperty(
    shapeNode: PropertySignature,
    parseTypeReference: (identifier: string) => ParsedType
  ): Omit<ParsedType, "doc" | "required"> {
    const name = StaticParsingHelpers.getEscapedName(shapeNode);
    const unionType = shapeNode.getFirstChildByKind(SyntaxKind.UnionType);
    if (unionType) {
      return this.parseUnionType(unionType, name);
    }

    const typeLiteral = shapeNode.getFirstChildByKind(SyntaxKind.TypeLiteral);
    if (typeLiteral) {
      return {
        kind: ParsedTypeKind.Object,
        type: this.parseShape(typeLiteral, parseTypeReference),
      };
    }

    const { type } = shapeNode.getStructure();
    if (typeof type !== "string") {
      throw new Error(
        `Unable to parse ${name} in node: ${shapeNode.getFullText()}`
      );
    }

    if (!TypeGuards.isPropValueType(type)) {
      return {
        kind: ParsedTypeKind.Object,
        type: parseTypeReference(type).type,
      };
    }
    return {
      kind: ParsedTypeKind.Simple,
      type,
    };
  }

  private static parseUnionType(unionType: UnionTypeNode, name: string) {
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

  private static toParsedProperty(
    partiallyParsedProperty: Omit<ParsedType, "docs" | "required">,
    required: boolean,
    doc?: string
  ): ParsedProperty {
    const { type, unionValues } = partiallyParsedProperty;

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
}
