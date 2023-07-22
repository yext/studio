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

      const shapeMetadata = propShape[propName];
      const propVal = propValues[propName];
      const valueIsTypeArray = propVal.valueType === PropValueType.Array;
      const valueIsTypeObject = propVal.valueType === PropValueType.Object;
      const valueKindIsLiteral = propVal.kind === PropValueKind.Literal;

      if (valueIsTypeArray && valueKindIsLiteral) {
        const arrayMissingProps = this.getMissingPropsInArray(
          propVal,
          shapeMetadata
        );
        missingProps.push(...arrayMissingProps);
      } else if (valueIsTypeObject) {
        const objectMissingProps = this.getMissingPropsInObject(
          propVal,
          shapeMetadata
        );
        missingProps.push(...objectMissingProps);
      }
    }
    return missingProps;
  }

  private static getMissingPropsInArray(
    propVal: ArrayProp,
    shapeMetadata: PropMetadata
  ): string[] {
    const missingProps: string[] = [];
    if (shapeMetadata.type === PropValueType.Array) {
      const shapeItemType = shapeMetadata.itemType;
      const isAnArrayOfObjects = shapeItemType.type === PropValueType.Object;
      const isAnArrayOfArrays = shapeItemType.type === PropValueType.Array;

      if (isAnArrayOfObjects) {
        const arrayShapes = shapeItemType.shape;
        for (const value of propVal.value) {
          if (value.valueType === PropValueType.Object) {
            const missingArrayProps = this.getMissingRequiredProps(
              value.value,
              arrayShapes
            );
            missingProps.push(...missingArrayProps);
          }
        }
      } else if (isAnArrayOfArrays) {
        const missingArrayProps = this.getMissingPropsInNestedArrays(
          propVal.value,
          shapeItemType
        );
        missingProps.push(...missingArrayProps);
      }
    }
    return missingProps;
  }

  private static getMissingPropsInObject(
    propVal: ObjectProp,
    shapeMetadata: PropMetadata
  ): string[] {
    const missingProps: string[] = [];
    if (shapeMetadata.type === PropValueType.Object) {
      const missingObjectProps = this.getMissingRequiredProps(
        propVal.value,
        shapeMetadata.shape
      );
      missingProps.push(...missingObjectProps);
    }
    return missingProps;
  }

  private static getMissingPropsInNestedArrays(
    valueArray: PropVal[],
    shapeItemType: PropType
  ): string[] {
    const missingProps: string[] = [];
    for (const value of valueArray) {
      const valueKindIsLiteral = value.kind === PropValueKind.Literal;
      const isTypeArray =
        value.valueType === PropValueType.Array &&
        shapeItemType.type === PropValueType.Array;
      const isTypeObject =
        value.valueType === PropValueType.Object &&
        shapeItemType.type === PropValueType.Object;

      if (isTypeArray && valueKindIsLiteral) {
        const missingObjectProps = this.getMissingPropsInNestedArrays(
          value.value,
          shapeItemType.itemType
        );
        missingProps.push(...missingObjectProps);
      } else if (isTypeObject) {
        const missingObjectProps = this.getMissingRequiredProps(
          value.value,
          shapeItemType.shape
        );
        missingProps.push(...missingObjectProps);
      }
    }
    return missingProps;
  }
}
