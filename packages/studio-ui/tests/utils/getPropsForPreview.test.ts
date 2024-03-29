/* eslint-disable no-template-curly-in-string */
import {
  PropMetadata,
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import { getPropsForPreview } from "../../src/utils/getPropsForPreview";

const siteSettings = {
  apiKey: "dummy-api-key",
  locale: "dummy-locale",
  isDevMode: true,
};

const entityData = {
  name: "office space",
  world: "whirled",
  hours: {
    openIntervals: [
      {
        start: "01:00",
        end: "03:00",
      },
      {
        start: "12:00",
        end: "14:00",
      },
    ],
    fakeIntervals: [
      {
        start: "01:00",
        end: "03:00",
      },
      {
        start: "12:00",
        end: 14,
      },
    ],
  },
};

const expressionSources = {
  siteSettings,
  document: entityData,
};

const propShape: PropShape = {
  foo: {
    type: PropValueType.string,
    required: false,
  },
};

const arrayPropMetadata: PropMetadata = {
  type: PropValueType.Array,
  itemType: {
    type: PropValueType.Object,
    shape: {
      start: {
        type: PropValueType.string,
        required: true,
      },
      end: {
        type: PropValueType.string,
        required: true,
      },
    },
  },
  required: false,
};
it("returns value as is for primitive prop of type Literal", () => {
  const transformedProps = getPropsForPreview(
    {
      foo: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "hello world",
      },
      bar: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "${document.name}",
      },
      buzz: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "siteSettings.apiKey",
      },
    },
    {
      foo: {
        type: PropValueType.string,
        required: false,
      },
      bar: {
        type: PropValueType.string,
        required: false,
      },
      buzz: {
        type: PropValueType.string,
        required: false,
      },
    },
    expressionSources
  );
  expect(transformedProps).toEqual({
    foo: "hello world",
    bar: "${document.name}",
    buzz: "siteSettings.apiKey",
  });
});

it("respects undefined for props with unspecified/undefined value", () => {
  const transformedProps = getPropsForPreview(
    {},
    {
      bgColor: {
        type: PropValueType.HexColor,
        required: false,
      },
    },
    expressionSources
  );
  expect(transformedProps).toEqual({});
});

it("logs a warning when transformed value type doesn't match from the expected type", () => {
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  const transformedProps = transformFooProp("siteSettings.isDevMode");
  expect(transformedProps).toEqual({
    foo: "siteSettings.isDevMode",
  });
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Invalid expression prop value:",
    siteSettings.isDevMode,
    'The value extracted from the expression "siteSettings.isDevMode" does' +
      ` not match with the expected propValueType ${PropValueType.string}`
  );
});

describe("expression value handling", () => {
  it("returns transformed value sourced from entity data", () => {
    const transformedProps = transformFooProp("document.name");
    expect(transformedProps).toEqual({
      foo: entityData.name,
    });
  });

  it("returns transformed value sourced from site settings", () => {
    const transformedProps = transformFooProp("siteSettings.apiKey");
    expect(transformedProps).toEqual({
      foo: siteSettings.apiKey,
    });
  });

  it("returns value as is when the expression reference an unknown source", () => {
    const transformedProps = transformFooProp("unknownSource.city");
    expect(transformedProps).toEqual({
      foo: "unknownSource.city",
    });
  });

  it("can handle expression that references an array of objects", () => {
    const transformedProps = getPropsForPreview(
      {
        bar: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.Array,
          value: "document.hours.openIntervals",
        },
      },
      { bar: arrayPropMetadata },
      expressionSources
    );
    expect(transformedProps.bar).toEqual(entityData.hours.openIntervals);
  });

  it("logs a warning when transformed array value doesn't match expected item type", () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const transformedProps = getPropsForPreview(
      {
        bar: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.Array,
          value: "document.hours.fakeIntervals",
        },
      },
      { bar: arrayPropMetadata },
      expressionSources
    );
    expect(transformedProps.bar).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Invalid expression prop value:",
      entityData.hours.fakeIntervals,
      'The value extracted from the expression "document.hours.fakeIntervals"' +
        ` does not match with the expected propValueType ${PropValueType.Array}`,
      "with item type",
      arrayPropMetadata.itemType
    );
  });
});

describe("template string literal value handling", () => {
  it("returns value as is when template string contain no expression", () => {
    const transformedProps = transformFooProp("`hello world`");
    expect(transformedProps).toEqual({
      foo: "hello world",
    });
  });

  it("returns transformed value when template string contain one expression", () => {
    const transformedProps = transformFooProp("`${siteSettings.apiKey}`");
    expect(transformedProps).toEqual({
      foo: `${siteSettings.apiKey}`,
    });
  });

  it("returns transformed value when template string contain multiple expressions", () => {
    const transformedProps = transformFooProp(
      "`1 ${siteSettings.locale} document.name ${siteSettings.apiKey}`"
    );
    expect(transformedProps).toEqual({
      foo: `1 ${siteSettings.locale} document.name ${siteSettings.apiKey}`,
    });
  });

  it("returns value as is when the template string contains unknown expression source reference", () => {
    const transformedProps = transformFooProp("`1 ${unknownSource.city} 2`");
    expect(transformedProps).toEqual({
      foo: "1 ${unknownSource.city} 2",
    });
  });
});

it("converts expressions using streams data into bracket syntax", () => {
  const transformedProps = transformFooProp("`${document.someField}`");
  expect(transformedProps).toEqual({
    foo: "[[someField]]",
  });
});

it("only applies bracket syntax to streams data", () => {
  const transformedProps = transformFooProp("`${siteSettings.someField}`");
  expect(transformedProps).toEqual({
    foo: "${siteSettings.someField}",
  });
});

it("applies expression sources for streams data", () => {
  const transformedProps = transformFooProp("`${document.name}`");
  expect(transformedProps).toEqual({
    foo: "office space",
  });
});

function transformFooProp(value: string) {
  return getPropsForPreview(
    {
      foo: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value,
      },
    },
    propShape,
    {
      ...expressionSources,
    }
  );
}

it("works with expressions inside object props", () => {
  const propValues: PropValues = {
    obj: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Object,
      value: {
        templateExpr: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`hello ${document.world}`",
        },
        expr: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "document.name",
        },
      },
    },
  };
  const propShape: PropShape = {
    obj: {
      type: PropValueType.Object,
      required: false,
      shape: {
        templateExpr: {
          type: PropValueType.string,
          required: false,
        },
        expr: {
          type: PropValueType.string,
          required: false,
        },
      },
    },
  };
  const previewProps = getPropsForPreview(
    propValues,
    propShape,
    expressionSources
  );
  expect(previewProps).toEqual({
    obj: {
      templateExpr: "hello whirled",
      expr: "office space",
    },
  });
});

it("works with expressions inside array props", () => {
  const propValues: PropValues = {
    arr: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.Array,
      value: [
        {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`hello ${document.world}`",
        },
        {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "document.name",
        },
      ],
    },
  };
  const propShape: PropShape = {
    arr: {
      type: PropValueType.Array,
      required: false,
      itemType: { type: PropValueType.string },
    },
  };
  const previewProps = getPropsForPreview(
    propValues,
    propShape,
    expressionSources
  );
  expect(previewProps).toEqual({
    arr: ["hello whirled", "office space"],
  });
});
