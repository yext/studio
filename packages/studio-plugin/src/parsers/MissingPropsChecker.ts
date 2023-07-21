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
	  const valueAndShapeAreArrays = shapeMetadata.type === PropValueType.Array && propVal.valueType === PropValueType.Array;
	  const valueAndShapeAreObjects = propVal.valueType === PropValueType.Object && shapeMetadata.type === PropValueType.Object;
	  const valueKindIsLiteral = propVal.kind === PropValueKind.Literal;
	  
      if (valueAndShapeAreArrays && valueKindIsLiteral) {
        const arrayMissingProps = this.getMissingPropsInArray(
          propVal,
          shapeMetadata
        );
        missingProps.push(...arrayMissingProps);
      } else if (valueAndShapeAreObjects) {
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
      const isAnArrayOfObjects = shapeItemType.type === PropValueType.Object 
      const isAnArrayOfArrays = shapeItemType.type === PropValueType.Array

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
      const valueAndShapeAreObjects =
        value.valueType === PropValueType.Object &&
        shapeItemType.type === PropValueType.Object;
      const valueAndShapeAreArrays =
        value.valueType === PropValueType.Array &&
        shapeItemType.type === PropValueType.Array;

      if (valueAndShapeAreObjects) {
        const missingObjectProps = this.getMissingRequiredProps(
          value.value,
          shapeItemType.shape
        );
        missingProps.push(...missingObjectProps);
      } else if (valueAndShapeAreArrays && valueKindIsLiteral) {
        const missingObjectProps = this.getMissingPropsInNestedArrays(
          value.value,
          shapeItemType.itemType
        );
        missingProps.push(...missingObjectProps);
      }
    }
    return missingProps;
  }
}
