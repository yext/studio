import {
  InterfaceDeclaration,
  PropertySignature,
  SyntaxKind,
  TypeNode,
  UnionTypeNode,
} from "ts-morph";
import { PropValueType } from "../../types";
import StaticParsingHelpers from "./StaticParsingHelpers";

export type ParsedInterface = {
  [key: string]:
    | {
        kind: ParsedInterfaceKind.Simple;
        type: string;
        required: boolean;
        unionValues?: string[];
        doc?: string;
      }
    | {
        kind: ParsedInterfaceKind.Nested;
        type: ParsedInterface;
        required: boolean;
      };
};

export enum ParsedInterfaceKind {
  Simple = "simple",
  Nested = "nested",
}

export default class InterfaceParsingHelper {
  static parseInterfaceDeclaration(interfaceDeclaration: InterfaceDeclaration) {
    return this.parsePropertySignatures(interfaceDeclaration.getProperties());
  }

  static parsePropertySignatures(
    propertySignatures: PropertySignature[]
  ): ParsedInterface {
    const parsedInterface: ParsedInterface = {};

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
      parsedInterface[propertyName] = parsePropertySignature(p);
    });
    return parsedInterface;
  }

  private static handleNestedType(typeNode: TypeNode, p: PropertySignature) {
    return {
      kind: ParsedInterfaceKind.Nested,
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
      kind: ParsedInterfaceKind.Simple,
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
      kind: ParsedInterfaceKind.Simple,
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
