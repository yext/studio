import {
  PropValueKind,
  PropValueType,
  PropValues,
} from "../../src/types/PropValues";
import { PropShape } from "../../src/types";
import MissingPropsChecker from "../../src/parsers/MissingPropsChecker";

describe("Checks that missing props are in an error state", () => {
  it("detects a missing surface level required prop", () => {
    const propShape: PropShape = {
      title: {
        type: PropValueType.string,
        required: true,
      },
    };
    const propVal: PropValues = {};
    const missingPropsReceived = MissingPropsChecker.getMissingRequiredProps(
      propVal,
      propShape
    );
    const missingPropsExpected = ["title"];
    expect(missingPropsReceived).toStrictEqual(missingPropsExpected);
  });

  it("detects missing required props inside object", () => {
    const propShape: PropShape = {
      obj: {
        type: PropValueType.Object,
        required: false,
        shape: {
          firstName: {
            required: true,
            type: PropValueType.string,
          },
          middleName: {
            required: true,
            type: PropValueType.string,
          },
          lastName: {
            required: true,
            type: PropValueType.string,
          },
        },
      },
    };
    const propVal: PropValues = {
      obj: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          firstName: {
            value: "Jane",
            kind: PropValueKind.Literal,
            valueType: PropValueType.string,
          },
        },
      },
    };
    const missingPropsReceived = MissingPropsChecker.getMissingRequiredProps(
      propVal,
      propShape
    );
    const missingPropsExpected = ["obj.middleName", "obj.lastName"];
    expect(missingPropsReceived).toStrictEqual(missingPropsExpected);
  });

  it("detects a missing required prop within an object in an array", () => {
    const propShape: PropShape = {
      names: {
        required: false,
        type: PropValueType.Array,
        itemType: {
          type: PropValueType.Object,
          shape: {
            first: {
              required: true,
              type: PropValueType.string,
            },
            last: {
              required: true,
              type: PropValueType.string,
            },
          },
        },
      },
    };
    const propVal: PropValues = {
      names: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Literal,
            valueType: PropValueType.Object,
            value: {
              first: {
                value: "John",
                kind: PropValueKind.Literal,
                valueType: PropValueType.string,
              },
            },
          },
        ],
      },
    };
    const missingPropsReceived = MissingPropsChecker.getMissingRequiredProps(
      propVal,
      propShape
    );
    const missingPropsExpected = ["names[0].last"];
    expect(missingPropsReceived).toStrictEqual(missingPropsExpected);
  });

  it("detects a missing objects' props in nested arrays", () => {
    const propShape: PropShape = {
      doublyNestedArray: {
        required: false,
        type: PropValueType.Array,
        itemType: {
          type: PropValueType.Array,
          itemType: {
            type: PropValueType.Object,
            shape: {
              name: {
                required: true,
                type: PropValueType.string,
              },
            },
          },
        },
      },
    };
    const propVal: PropValues = {
      doublyNestedArray: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Literal,
            valueType: PropValueType.Array,
            value: [
              {
                kind: PropValueKind.Literal,
                valueType: PropValueType.Object,
                value: {},
              },
            ],
          },
        ],
      },
    };
    const missingPropsReceived = MissingPropsChecker.getMissingRequiredProps(
      propVal,
      propShape
    );
    const missingPropsExpected = ["doublyNestedArray[0][0].name"];
    expect(missingPropsReceived).toStrictEqual(missingPropsExpected);
  });

  it("does not perform checking on expression values", () => {
    const propShape: PropShape = {
      title: {
        type: PropValueType.string,
        required: true,
      },
    };
    const propVal: PropValues = {
      title: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "document.nothing",
      },
    };
    const missingPropsReceived = MissingPropsChecker.getMissingRequiredProps(
      propVal,
      propShape
    );
    const missingPropsExpected = [];
    expect(missingPropsReceived).toStrictEqual(missingPropsExpected);
  });
});
