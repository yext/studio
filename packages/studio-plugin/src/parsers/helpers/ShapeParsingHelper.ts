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
};

export type NestedParsedShapeType = { [key: string]: ParsedShape };

export enum ParsedShapeKind {
  Simple = "simple",
  Nested = "nested",
}

export default class ShapeParsingHelper {
  static parseShape(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration | PropertySignature,
    parseExternalShape: (
      identifier: string,
      required: boolean,
      jsDoc?: string
    ) => ParsedShape | undefined,
    required: boolean,
    jsDoc?: string
  ): ParsedShape {
    if (shapeNode.isKind(SyntaxKind.InterfaceDeclaration)) {
      return this.handleNestedType(shapeNode, parseExternalShape, required);
    }

    const typeLiteral = shapeNode.getFirstChildByKind(SyntaxKind.TypeLiteral);
    if (typeLiteral) {
      return this.handleNestedType(typeLiteral, parseExternalShape, required);
    }

    const name = StaticParsingHelpers.getEscapedName(shapeNode);
    const unionType = shapeNode.getFirstChildByKind(SyntaxKind.UnionType);
    if (unionType) {
      return this.handleUnionType(unionType, name, required, jsDoc);
    }

    const { type } = shapeNode.getStructure();
    if (typeof type !== "string") {
      throw new Error(
        `Unable to parse ${name} in node: ${shapeNode.getFullText()}`
      );
    }
    if (!TypeGuards.isPropValueType(type)) {
      const externalShape = parseExternalShape(type, required, jsDoc);
      if (externalShape) {
        return externalShape;
      }
    }

    return {
      kind: ParsedShapeKind.Simple,
      type,
      ...(jsDoc && { doc: jsDoc }),
      required,
    };
  }

  private static handleNestedType(
    shapeDeclaration: InterfaceDeclaration | TypeLiteralNode,
    parseExternalShape: (
      identifier: string,
      required: boolean,
      jsDoc?: string
    ) => ParsedShape | undefined,
    required: boolean
  ): NestedParsedShape {
    const properties = shapeDeclaration.getProperties();
    const nestedParsedShapeType: NestedParsedShapeType = {};

    properties.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      nestedParsedShapeType[propertyName] = this.parseShape(
        p,
        parseExternalShape,
        !p.hasQuestionToken(),
        this.getJsDocs(p)
      );
    });
    return {
      kind: ParsedShapeKind.Nested,
      type: nestedParsedShapeType,
      required,
    };
  }

  private static handleUnionType(
    unionType: UnionTypeNode,
    name: string,
    required: boolean,
    jsDoc?: string
  ): SimpleParsedShape {
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
      kind: ParsedShapeKind.Simple,
      type: PropValueType.string,
      unionValues,
      ...(jsDoc && { doc: jsDoc }),
      required,
    };
  }

  private static getJsDocs(propertySignature: PropertySignature) {
    const docs = propertySignature.getStructure().docs;
    return docs
      ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
      .join("\n");
  }
}
