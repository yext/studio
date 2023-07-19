import {
	PropShape,
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
				if (
					shapeMetadata.itemType.type !== PropValueType.Object ||
					valueMetadata.valueType !== PropValueType.Array ||
					valueMetadata.kind !== PropValueKind.Literal
				) {
					continue;
				}
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
			} else if (shapeMetadata.type === PropValueType.Object) {
				if (valueMetadata.valueType === PropValueType.Object) {
					const objectShape = shapeMetadata.shape;
					const missingObjectProps = this.getMissingRequiredProps(
						valueMetadata.value,
						objectShape
					);
					missingProps.push(...missingObjectProps);
				}
			}
		}
		return missingProps;
	}   
}