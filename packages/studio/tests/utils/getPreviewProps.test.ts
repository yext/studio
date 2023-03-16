/* eslint-disable no-template-curly-in-string */
import {
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
} from "@yext/studio-plugin";
import { getPreviewProps } from "../../src/utils/getPreviewProps";

const siteSettings = {
  apiKey: "dummy-api-key",
  locale: "dummy-locale",
  isDevMode: true,
};

const streamDocument = {
  name: "office space",
};

const expressionSources = {
  siteSettings,
  document: streamDocument,
};

const propShape: PropShape = {
  foo: {
    type: PropValueType.string,
  },
};

it("returns value as is for prop of type Literal", () => {
  const transformedProps = getPreviewProps(
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
      },
      bar: {
        type: PropValueType.string,
      },
      buzz: {
        type: PropValueType.string,
      },
    },
    expressionSources,
    {}
  );
  expect(transformedProps).toEqual({
    foo: "hello world",
    bar: "${document.name}",
    buzz: "siteSettings.apiKey",
  });
});

it("uses default value for props with unspecified/undefined value", () => {
  const transformedProps = getPreviewProps(
    {},
    {
      bgColor: {
        type: PropValueType.HexColor,
      },
    },
    expressionSources,
    {}
  );
  expect(transformedProps).toEqual({
    bgColor: "#FFFFFF",
  });
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
    `Invalid expression prop value: ${siteSettings.isDevMode}. The value extracted from the expression` +
      ` "siteSettings.isDevMode" does not match with the expected propType ${PropValueType.string}.`
  );
});

describe("expression value handling", () => {
  it("returns transformed value sourced from stream document", () => {
    const transformedProps = transformFooProp("document.name");
    expect(transformedProps).toEqual({
      foo: streamDocument.name,
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

  it("can handle expressions that reference literal props", () => {
    const transformedProps = transformFooProp("props.title", {
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "the title prop",
      },
    });
    expect(transformedProps).toEqual({
      foo: "the title prop",
    });
  });

  it("can handle expressions that reference expression props", () => {
    const transformedProps = transformFooProp("props.title", {
      title: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "document.name",
      },
    });
    expect(transformedProps).toEqual({
      foo: "office space",
    });
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

  it("can handle an expression prop that references a parent expression prop", () => {
    const transformedProps = transformFooProp(
      "`childProp - ${props.parentExpression}`",
      {
        parentExpression: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`parentProp - ${document.name}`",
        },
      }
    );
    expect(transformedProps).toEqual({
      foo: "childProp - parentProp - office space",
    });
  });
});

it("converts expressions using streams data into bracket syntax", () => {
  const transformedProps = transformFooProp("`${document.someField}`");
  expect(transformedProps).toEqual({
    foo: "[[someField]]",
  });
});

it("applies expression sources for streams data", () => {
  const transformedProps = transformFooProp("`${document.name}`");
  expect(transformedProps).toEqual({
    foo: "office space",
  });
});

function transformFooProp(value: string, parentProps: PropValues = {}) {
  return getPreviewProps(
    {
      foo: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value,
      },
    },
    propShape,
    expressionSources,
    parentProps
  );
}
