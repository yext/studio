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
    propShape: PropShape | undefined,
    path?: string
  ): string[] {
    if (!propShape) {
      return [];
    }

    return Object.keys(propShape).flatMap((propName) => {
      const propVal = propValues[propName];
      const propMetadata = propShape[propName];
      const pathToPropName = path
        ? this.getExtendedFieldPath(path, propName)
        : propName;
      if (propVal === undefined) {
        if (propMetadata.required) {
          return pathToPropName;
        }
        return [];
      }

      return this.getMissingFieldsFromProp(
        propVal,
        propMetadata,
        pathToPropName
      );
    });
  }

  private static getMissingFieldsFromProp(
    propVal: PropVal,
    propMetadata: PropType,
    path: string
  ): string[] {
    if (propVal.kind === PropValueKind.Expression) {
      return [];
    }

    if (
      propVal.valueType === PropValueType.Array &&
      propMetadata.type === PropValueType.Array
    ) {
      const itemType: PropType = propMetadata.itemType;
      return propVal.value.flatMap((val, index) => {
        const pathWithArrayIndex = `${path}[${index}]`;
        return this.getMissingFieldsFromProp(val, itemType, pathWithArrayIndex);
      });
    } else if (
      propVal.valueType === PropValueType.Object &&
      propMetadata.type === PropValueType.Object
    ) {
      return this.getMissingRequiredProps(
        propVal.value,
        propMetadata.shape,
        path
      );
    }
    return [];
  }

  private static getExtendedFieldPath(
    currentPath: string,
    propName: string
  ): string {
    return `${currentPath}.${propName}`;
  }
}
