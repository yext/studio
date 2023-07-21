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
			const arrayMissingProps = this.getMissingPropsInArray(valueMetadata, shapeMetadata);
			const objectMissingProps = this.getMissingPropsInObject(valueMetadata, shapeMetadata);
			missingProps.push(...arrayMissingProps)
			missingProps.push(...objectMissingProps)
		}
		return missingProps;
	} 

	private getMissingPropsInArray(
		valueMetadata: PropVal,
		shapeMetadata: PropMetadata
	): string[]{
		const missingProps: string[] = [];
		if (shapeMetadata.type === PropValueType.Array) {
			if (
				shapeMetadata.itemType.type === PropValueType.Object &&
				valueMetadata.valueType === PropValueType.Array &&
				valueMetadata.kind === PropValueKind.Literal
			) {
				const arrayShapes = shapeMetadata.itemType.shape;
				for (const value of valueMetadata.value) {
					if (value.valueType === PropValueType.Object) {
						const missingArrayProps = this.getMissingRequiredProps(
							value.value,
							arrayShapes
						);
						missingProps.push(...missingArrayProps);
					}
				}
			} else if (
				shapeMetadata.itemType.type === PropValueType.Array &&
				valueMetadata.valueType === PropValueType.Array &&
				valueMetadata.kind === PropValueKind.Literal
			) {
				const arrayShapes = shapeMetadata.itemType;
				const missingArrayProps = this.getMissingPropsInNestedArrays(valueMetadata.value, arrayShapes)
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
		if (shapeMetadata.type === PropValueType.Object) {
			if (valueMetadata.valueType === PropValueType.Object) {
				const objectShape = shapeMetadata.shape;
				const missingObjectProps = this.getMissingRequiredProps(
					valueMetadata.value,
					objectShape
				);
				missingProps.push(...missingObjectProps);
			}
		}
		return missingProps;
	}

	private getMissingPropsInNestedArrays(
		valueArray: PropVal[], 
		shape: PropType
	): string[] {
		const missingProps: string[] = [];
		for (const value of valueArray) {
			if (
				value.valueType === PropValueType.Object &&
				shape.type == PropValueType.Object
			) {
				const missingObjectProps = this.getMissingRequiredProps(value.value, shape.shape)
				missingProps.push(...missingObjectProps);
			} else if (
				value.kind === PropValueKind.Literal &&
				value.valueType === PropValueType.Array &&
				shape.type === PropValueType.Array
			) {
				const missingObjectProps = this.getMissingPropsInNestedArrays(value.value, shape.itemType);
				missingProps.push(...missingObjectProps);
			}
		}
		return missingProps
	}
}

