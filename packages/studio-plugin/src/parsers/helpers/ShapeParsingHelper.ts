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

export type ParsedShape = SimpleParsedShape | NestedParsedShape;

type SimpleParsedShape = {
  kind: ParsedShapeKind.Simple;
  type: string;
  required: boolean;
  unionValues?: string[];
  doc?: string;
};

type NestedParsedShape = {
  kind: ParsedShapeKind.Nested;
  type: NestedParsedShapeType;
  required: boolean;
  unionValues?: never;
};

export type NestedParsedShapeType = { [key: string]: ParsedShape };

type ParsedTypeData = Pick<ParsedShape, "type" | "unionValues">;

export enum ParsedShapeKind {
  Simple = "simple",
  Nested = "nested",
}

export default class ShapeParsingHelper {
  static parseShape(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration,
    parseExternalShape: (
      identifier: string,
      required: boolean,
      jsDoc?: string
    ) => ParsedShape | undefined,
    required: boolean,
    jsDoc?: string
  ): ParsedShape {
    const parsedTypeData = this.parseTypeNode(shapeNode, (identifier) =>
      parseExternalShape(identifier, required, jsDoc)
    );
    return this.toParsedShape(parsedTypeData, required, jsDoc);
  }

  private static parseTypeNode(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration | PropertySignature,
    parseExternalShape: (identifier: string) => ParsedTypeData | undefined
  ): ParsedTypeData {
    if (shapeNode.isKind(SyntaxKind.InterfaceDeclaration)) {
      return this.handleObjectType(shapeNode, parseExternalShape);
    }

    const typeLiteral = shapeNode.getFirstChildByKind(SyntaxKind.TypeLiteral);
    if (typeLiteral) {
      return this.handleObjectType(typeLiteral, parseExternalShape);
    }

    const name = StaticParsingHelpers.getEscapedName(shapeNode);
    const unionType = shapeNode.getFirstChildByKind(SyntaxKind.UnionType);
    if (unionType) {
      return this.handleUnionType(unionType, name);
    }

    const { type } = shapeNode.getStructure();
    if (typeof type !== "string") {
      throw new Error(
        `Unable to parse ${name} in node: ${shapeNode.getFullText()}`
      );
    }
    if (!TypeGuards.isPropValueType(type)) {
      const externalShape = parseExternalShape(type);
      if (externalShape) {
        return externalShape;
      }
    }
    return { type };
  }

  private static toParsedShape(
    parsedType: ParsedTypeData,
    required: boolean,
    doc?: string
  ): ParsedShape {
    const { type, unionValues } = parsedType;
    return typeof type === "string"
      ? {
        kind: ParsedShapeKind.Simple,
        type,
        unionValues,
        required,
        ...doc && { doc },
      }
      : {
        kind: ParsedShapeKind.Nested,
        type,
        required
      };
  }

  private static handleObjectType(
    shapeDeclaration: InterfaceDeclaration | TypeLiteralNode,
    parseExternalShape: (identifier: string) => ParsedTypeData | undefined
  ): ParsedTypeData {
    const properties = shapeDeclaration.getProperties();
    const nestedParsedShapeType: NestedParsedShapeType = {};

    properties.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      const parsedType = this.parseTypeNode(p, parseExternalShape);
      nestedParsedShapeType[propertyName] = this.toParsedShape(
        parsedType,
        !p.hasQuestionToken(),
        this.getJsDocs(p)
      );
    });
    return { type: nestedParsedShapeType };
  }

  private static handleUnionType(
    unionType: UnionTypeNode,
    name: string
  ): ParsedTypeData {
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
