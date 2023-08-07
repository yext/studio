import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeLiteralNode,
  TypeAliasDeclaration,
  ArrayTypeNode,
  TypeReferenceNode,
  Node,
  TypeNode,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";
import { TypeGuards } from "../../utils";
import StringUnionParsingHelper from "./StringUnionParsingHelper";

export type ParsedType =
  | SimpleParsedType
  | ObjectParsedType
  | StringLiteralType
  | ArrayParsedType;

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

type ArrayParsedType = {
  kind: ParsedTypeKind.Array;
  type: ParsedType;
  unionValues?: never;
};

export type ParsedShape = { [key: string]: ParsedProperty };

export type ParsedProperty = ParsedType & {
  tooltip?: string;
  displayName?: string;
  required: boolean;
};

export enum ParsedTypeKind {
  Simple = "simple",
  Object = "object",
  StringLiteral = "stringLiteral",
  Array = "array",
}

export enum CustomTags {
  Tooltip = "tooltip",
  DisplayName = "displayName",
}

export default class TypeNodeParsingHelper {
  static parseShape(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
    const parsedType = this.parseShapeNode(shapeNode, parseTypeReference);
    return parsedType;
  }

  private static parseShapeNode(
    shapeNode: InterfaceDeclaration | TypeAliasDeclaration | PropertySignature,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
    if (shapeNode.isKind(SyntaxKind.InterfaceDeclaration)) {
      return this.handleObjectType(shapeNode, parseTypeReference);
    }
    const name = StaticParsingHelpers.getEscapedName(shapeNode);

    const typeNode = shapeNode.getFirstChild(Node.isTypeNode);
    if (typeNode) {
      return this.parseTypeNode(typeNode, name, parseTypeReference);
    }

    const type = shapeNode.getStructure().type?.toString();
    if (!type) {
      throw new Error(
        `Unable to parse ${name} in node: ${shapeNode.getFullText()}`
      );
    }
    return this.handleTypeString(type, parseTypeReference);
  }

  private static parseTypeNode(
    typeNode: TypeNode,
    name: string,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
    if (typeNode.isKind(SyntaxKind.TypeLiteral)) {
      return this.handleObjectType(typeNode, parseTypeReference);
    } else if (
      typeNode.isKind(SyntaxKind.ArrayType) ||
      (typeNode.isKind(SyntaxKind.TypeReference) &&
        typeNode.getTypeName().getText() === PropValueType.Array)
    ) {
      return this.handleArrayType(typeNode, name, parseTypeReference);
    } else if (typeNode.isKind(SyntaxKind.LiteralType)) {
      const literal = typeNode.getLiteral();
      if (!literal.isKind(SyntaxKind.StringLiteral)) {
        throw new Error(
          `Only string literals are supported within type nodes. Found ${typeNode.getText()}`
        );
      }
      return {
        kind: ParsedTypeKind.StringLiteral,
        type: literal.getLiteralValue(),
      };
    } else if (typeNode.isKind(SyntaxKind.UnionType)) {
      const unionValues = StringUnionParsingHelper.parseStringUnion(
        typeNode,
        name,
        parseTypeReference
      );
      return {
        kind: ParsedTypeKind.Simple,
        type: PropValueType.string,
        unionValues,
      };
    } else {
      const type = typeNode.getText();
      return this.handleTypeString(type, parseTypeReference);
    }
  }

  private static handleObjectType(
    shapeDeclaration: InterfaceDeclaration | TypeLiteralNode,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ObjectParsedType {
    const properties = shapeDeclaration.getProperties();
    const parsedShape: ParsedShape = {};

    properties.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      const parsedType = this.parseShapeNode(p, parseTypeReference);
      const tooltip = this.getTagValue(p, CustomTags.Tooltip);
      const displayName = this.getTagValue(p, CustomTags.DisplayName);
      parsedShape[propertyName] = {
        ...parsedType,
        required: !p.hasQuestionToken(),
        ...(tooltip && { tooltip }),
        ...(displayName && { displayName }),
      };
    });
    return {
      kind: ParsedTypeKind.Object,
      type: parsedShape,
    };
  }

  private static handleArrayType(
    typeNode: ArrayTypeNode | TypeReferenceNode,
    name: string,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ArrayParsedType {
    function getElementTypeNode(): TypeNode {
      if (typeNode.isKind(SyntaxKind.ArrayType)) {
        return typeNode.getElementTypeNode();
      }

      const typeArgs = typeNode.getTypeArguments();
      if (typeArgs.length !== 1) {
        throw new Error(
          `One type param expected for Array type. Found ${typeArgs.length}.`
        );
      }
      return typeArgs[0];
    }

    const elementTypeNode = getElementTypeNode();
    return {
      kind: ParsedTypeKind.Array,
      type: this.parseTypeNode(elementTypeNode, name, parseTypeReference),
    };
  }

  private static handleTypeString(
    type: string,
    parseTypeReference: (identifier: string) => ParsedType | undefined
  ): ParsedType {
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

  private static getTagValue(
    propertySignature: PropertySignature,
    customTag: CustomTags
  ): string | undefined {
    const firstDoc = propertySignature.getJsDocs()[0];
    if (!firstDoc) {
      return;
    }

    for (const tag of firstDoc.getTags()) {
      const commentText = tag.getCommentText();
      if (tag.getTagName() === customTag && commentText) {
        return commentText;
      }
    }
  }
}
