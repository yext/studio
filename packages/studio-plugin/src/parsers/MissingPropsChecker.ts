import {
	PropMetadata,
	PropShape,
	PropType,
	PropVal,
	PropValueKind,
	PropValueType,
	PropValues
} from "../types";

export default class MissingPropsChecker {

	getMissingRequiredProps(
		propValues: PropValues,
		propShape: PropShape | undefined
	): string[] {
		const missingProps: string[] = [];
		if (!propShape) {
			return [];
		}

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
			const valueMetadata = propValues[propName];
			if (shapeMetadata.type === PropValueType.Array) {
				const arrayMissingProps = this.getMissingPropsInArray(valueMetadata, shapeMetadata);
				missingProps.push(...arrayMissingProps);
			} else if (shapeMetadata.type === PropValueType.Object) {
				const objectMissingProps = this.getMissingPropsInObject(valueMetadata, shapeMetadata);
				missingProps.push(...objectMissingProps);
			}
		}
		return missingProps;
	} 

	private getMissingPropsInArray(
		valueMetadata: PropVal,
		shapeMetadata: PropMetadata
	): string[]{
		const missingProps: string[] = [];
		if (shapeMetadata.type === PropValueType.Array) {
			const shapeItemType = shapeMetadata.itemType
			const valueIsKindLiteral = valueMetadata.kind === PropValueKind.Literal
			const isAnArrayOfObjects = shapeItemType.type === PropValueType.Object && valueMetadata.valueType === PropValueType.Array
			const isAnArrayOfArrays = shapeItemType.type === PropValueType.Array && valueMetadata.valueType === PropValueType.Array

			if (isAnArrayOfObjects && valueIsKindLiteral) {
				const arrayShapes = shapeItemType.shape;
				for (const value of valueMetadata.value) {
					if (value.valueType === PropValueType.Object) {
						const missingArrayProps = this.getMissingRequiredProps(
							value.value,
							arrayShapes
						);
						missingProps.push(...missingArrayProps);
					}
				}
			} else if (isAnArrayOfArrays && valueIsKindLiteral) {
				const missingArrayProps = this.getMissingPropsInNestedArrays(valueMetadata.value, shapeItemType)
				missingProps.push(...missingArrayProps);
			}
		}
		return missingProps;
	}

	private getMissingPropsInObject(
		valueMetadata: PropVal,
		shapeMetadata: PropMetadata
	): string[]{
		const missingProps: string[] = [];
		const valueAndShapeAreObjects = valueMetadata.valueType === PropValueType.Object && shapeMetadata.type === PropValueType.Object 

		if (valueAndShapeAreObjects) {
			const missingObjectProps = this.getMissingRequiredProps(
				valueMetadata.value,
				shapeMetadata.shape
			);
			missingProps.push(...missingObjectProps)
		}
		return missingProps;
	}

	private getMissingPropsInNestedArrays(
		valueArray: PropVal[], 
		shapeItemType: PropType
	): string[] {
		const missingProps: string[] = [];
		for (const value of valueArray) {
			const valueKindIsLiteral = value.kind === PropValueKind.Literal
			const valueAndShapeAreObjects = value.valueType === PropValueType.Object && shapeItemType.type === PropValueType.Object
			const valueAndShapeAreArrays = value.valueType === PropValueType.Array && shapeItemType.type === PropValueType.Array

			if (valueAndShapeAreObjects) {
				const missingObjectProps = this.getMissingRequiredProps(value.value, shapeItemType.shape)
				missingProps.push(...missingObjectProps);
			} else if (valueAndShapeAreArrays && valueKindIsLiteral) {
				const missingObjectProps = this.getMissingPropsInNestedArrays(value.value, shapeItemType.itemType);
				missingProps.push(...missingObjectProps);
			}
		}
		return missingProps
	}
}

