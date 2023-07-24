import {
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

    return Object.keys(propShape).flatMap((propName) => {
      const propVal = propValues[propName];
      const propMetadata = propShape[propName];
      if (propVal === undefined) {
        if (propMetadata.required) {
         return propName
        }
        return []
      }
      return this.handleArrayAndObjectProps(propVal, propMetadata)
    })
  }

  private static handleArrayAndObjectProps(propVal: PropVal, propMetadata: PropType): string[] {
    if (propVal.kind === PropValueKind.Expression) {
      return []
    }

    if (propVal.valueType === PropValueType.Array && propMetadata.type ===  PropValueType.Array) {
      const itemType: PropType = propMetadata.itemType;
      return propVal.value.flatMap(val => {
        return this.handleArrayAndObjectProps(val, itemType)
      });
    } else if (propVal.valueType === PropValueType.Object && propMetadata.type ===  PropValueType.Object) {
      return this.getMissingRequiredProps(
        propVal.value,
        propMetadata.shape
      );
    }
    return []
  }
}
