import { TypeNode, TypeReferenceNode } from "ts-morph";
import {
  ParsedShape,
  ParsedType,
  ParsedTypeKind,
} from "./TypeNodeParsingHelpers";

type UtilityTypeHandler = (
  typeArgs: TypeNode[],
  parseTypeNode: (node: TypeNode) => ParsedType
) => ParsedType;

export default class UtilityTypeParsingHelper {
  static parseUtilityType(
    typeRefNode: TypeReferenceNode,
    parseTypeNode: (node: TypeNode) => ParsedType
  ): ParsedType | undefined {
    const typeName = typeRefNode.getTypeName().getText();
    const typeArgs = typeRefNode.getTypeArguments();

    const utilityTypeHandler: UtilityTypeHandler | undefined = (() => {
      switch (typeName) {
        case "Omit":
          return this.handleOmit;
        case "Pick":
          return this.handlePick;
        case "Required":
          return this.handleRequired;
      }
    })();
    return utilityTypeHandler?.(typeArgs, parseTypeNode);
  }

  private static handleOmit: UtilityTypeHandler = (typeArgs, parseTypeNode) => {
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
  };

  private static handlePick: UtilityTypeHandler = (typeArgs, parseTypeNode) => {
    if (typeArgs.length !== 2) {
      throw new Error(
        `Two type params expected for Pick utility type. Found ${typeArgs.length}.`
      );
    }

    const [fullType, pickType] = typeArgs.map(parseTypeNode);

    if (fullType.kind !== ParsedTypeKind.Object) {
      throw new Error(
        "Only object types are supported for first type arg of Pick utility type." +
          ` Found ${fullType}.`
      );
    }
    if (
      !pickType.unionValues &&
      pickType.kind !== ParsedTypeKind.StringLiteral
    ) {
      throw new Error(
        "Expected string literal or union of string literals for second type arg of Pick utility type." +
          ` Found ${pickType}.`
      );
    }

    const pickKeys = pickType.unionValues ?? [pickType.type];
    const reducedShape: ParsedShape = pickKeys.reduce((reducedShape, key) => {
      const parsedProperty = fullType.type[key];
      if (!parsedProperty) {
        throw new Error(
          `Cannot pick key ${key} that is not present in type ${fullType.type}.`
        );
      }
      return {
        ...reducedShape,
        [key]: parsedProperty,
      };
    }, {});

    return {
      ...fullType,
      type: reducedShape,
    };
  };

  private static handleRequired: UtilityTypeHandler = (
    typeArgs,
    parseTypeNode
  ) => {
    if (typeArgs.length !== 1) {
      throw new Error(
        `One type param expected for Required utility type. Found ${typeArgs.length}.`
      );
    }

    const originalType = parseTypeNode(typeArgs[0]);

    if (originalType.kind !== ParsedTypeKind.Object) {
      return originalType;
    }

    const updatedShape: ParsedShape = Object.entries(originalType.type).reduce(
      (updatedShape, [key, property]) => {
        return {
          ...updatedShape,
          [key]: {
            ...property,
            required: true,
          },
        };
      },
      {}
    );

    return {
      ...originalType,
      type: updatedShape,
    };
  };
}
