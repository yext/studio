import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeNode,
  UnionTypeNode,
  TypeLiteralNode,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";

export type ParsedShape = {
  [key: string]:
    | {
        kind: ParsedShapeKind.Simple;
        type: string;
        required: boolean;
        unionValues?: string[];
        doc?: string;
      }
    | {
        kind: ParsedShapeKind.Nested;
        type: ParsedShape;
        required: boolean;
      };
};

export enum ParsedShapeKind {
  Simple = "simple",
  Nested = "nested",
}

export default class ShapeParsingHelper {
  static parseShape(shapeDeclaration: InterfaceDeclaration | TypeLiteralNode) {
    return this.parsePropertySignatures(shapeDeclaration.getProperties());
  }

  private static parsePropertySignatures(
    propertySignatures: PropertySignature[]
  ): ParsedShape {
    const parsedShape: ParsedShape = {};

    const parsePropertySignature = (p: PropertySignature) => {
      const typeNode = p.getTypeNode();
      if (typeNode?.isKind(SyntaxKind.TypeLiteral)) {
        return this.handleNestedType(typeNode, p);
      }
      const unionType = p.getFirstChildByKind(SyntaxKind.UnionType);
      if (unionType) {
        return this.handleUnionType(p, unionType);
      }
      return this.handleSimplePropertySignature(p);
    };

    propertySignatures.forEach((p) => {
      const propertyName = StaticParsingHelpers.getEscapedName(p);
      parsedShape[propertyName] = parsePropertySignature(p);
    });
    return parsedShape;
  }

  private static handleNestedType(typeNode: TypeNode, p: PropertySignature) {
    return {
      kind: ParsedShapeKind.Nested,
      type: this.parsePropertySignatures(
        typeNode.getChildrenOfKind(SyntaxKind.PropertySignature)
      ),
      required: !p.hasQuestionToken(),
    } as const;
  }

  private static handleSimplePropertySignature(p: PropertySignature) {
    const { name: propName, type } = p.getStructure();
    if (typeof type !== "string") {
      throw new Error(
        `Unable to parse prop: ${propName} in PropertySignature: ${p.getFullText()}`
      );
    }

    const jsdoc = this.getJsDocs(p);
    return {
      kind: ParsedShapeKind.Simple,
      type,
      ...(jsdoc && { doc: jsdoc }),
      required: !p.hasQuestionToken(),
    } as const;
  }

  private static handleUnionType(
    p: PropertySignature,
    unionType: UnionTypeNode
  ) {
    const unionValues = unionType.getTypeNodes().map((n) => {
      const firstChild = n.getFirstChild();
      if (!firstChild?.isKind(SyntaxKind.StringLiteral)) {
        throw new Error(
          `Union types only support strings. Found a ${firstChild?.getKindName()} ` +
            `within "${StaticParsingHelpers.getEscapedName(p)}".`
        );
      }
      return firstChild.getLiteralText();
    });

    const jsdoc = this.getJsDocs(p);
    return {
      kind: ParsedShapeKind.Simple,
      type: PropValueType.string,
      unionValues,
      ...(jsdoc && { doc: jsdoc }),
      required: !p.hasQuestionToken(),
    } as const;
  }

  private static getJsDocs(propertySignature: PropertySignature) {
    const docs = propertySignature.getStructure().docs;
    return docs
      ?.map((doc) => (typeof doc === "string" ? doc : doc.description))
      .join("\n");
  }
}
