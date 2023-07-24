import {
  ArrayProp,
  ObjectProp,
  PropMetadata,
  PropShape,
  PropType,
  PropVal,
  PropValueKind,
  PropValueType,
  PropValues,
} from "../types";

export default class MissingPropsChecker {
  static getMissingRequiredProps(
    propValues: PropValues,
    propShape: PropShape | undefined
  ): string[] {
    if (!propShape) {
      return [];
    }

    const missingProps: string[] = [];
    for (const propName of Object.keys(propShape)) {
      const propIsRequired = propShape[propName].required;
      const propIsUndefined = propValues[propName] === undefined;
      if (propIsRequired && propIsUndefined) {
        missingProps.push(propName);
        continue;
      }
      if (propIsUndefined) {
        continue;
      }

      const propMetadata = propShape[propName];
      const propVal = propValues[propName];
      const valueIsTypeArray = propVal.valueType === PropValueType.Array;
      const valueIsTypeObject = propVal.valueType === PropValueType.Object;
      const valueKindIsLiteral = propVal.kind === PropValueKind.Literal;

      if (valueIsTypeArray && valueKindIsLiteral) {
        const arrayMissingProps = this.getMissingPropsInArray(
          propVal,
          propMetadata
        );
        missingProps.push(...arrayMissingProps);
      } else if (valueIsTypeObject) {
        const objectMissingProps = this.getMissingPropsInObject(
          propVal,
          propMetadata
        );
        missingProps.push(...objectMissingProps);
      }
    }
    return missingProps;
  }

  private static getMissingPropsInArray(
    propVal: ArrayProp,
    propMetadata: PropMetadata
  ): string[] {
    const missingProps: string[] = [];
    if (propMetadata.type === PropValueType.Array) {
      const itemType = propMetadata.itemType;
      const isAnArrayOfObjects = itemType.type === PropValueType.Object;
      const isAnArrayOfArrays = itemType.type === PropValueType.Array;

      if (isAnArrayOfObjects) {
        const arrayItemShape = itemType.shape;
        for (const value of propVal.value) {
          if (value.valueType === PropValueType.Object) {
            const missingArrayProps = this.getMissingRequiredProps(
              value.value,
              arrayItemShape
            );
            missingProps.push(...missingArrayProps);
          }
        }
      } else if (isAnArrayOfArrays) {
        const missingArrayProps = this.getMissingPropsInNestedArrays(
          propVal.value,
          itemType
        );
        missingProps.push(...missingArrayProps);
      }
    }
    return missingProps;
  }

  private static getMissingPropsInObject(
    propVal: ObjectProp,
    propMetadata: PropMetadata
  ): string[] {
    const missingProps: string[] = [];
    if (propMetadata.type === PropValueType.Object) {
      const missingObjectProps = this.getMissingRequiredProps(
        propVal.value,
        propMetadata.shape
      );
      missingProps.push(...missingObjectProps);
    }
    return missingProps;
  }

  private static getMissingPropsInNestedArrays(
    valueArray: PropVal[],
    itemType: PropType
  ): string[] {
    const missingProps: string[] = [];
    for (const value of valueArray) {
      const valueKindIsLiteral = value.kind === PropValueKind.Literal;
      const isTypeArray =
        value.valueType === PropValueType.Array &&
        itemType.type === PropValueType.Array;
      const isTypeObject =
        value.valueType === PropValueType.Object &&
        itemType.type === PropValueType.Object;

      if (isTypeArray && valueKindIsLiteral) {
        const missingObjectProps = this.getMissingPropsInNestedArrays(
          value.value,
          itemType.itemType
        );
        missingProps.push(...missingObjectProps);
      } else if (isTypeObject) {
        const missingObjectProps = this.getMissingRequiredProps(
          value.value,
          itemType.shape
        );
        missingProps.push(...missingObjectProps);
      }
    }
    return missingProps;
  }
}
