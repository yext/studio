/* eslint-disable no-template-curly-in-string */
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import { getPreviewProps } from "../../src/utils/getPreviewProps";

const siteSettings = {
  apiKey: "dummy-api-key",
  locale: "dummy-locale",
  isDevMode: true,
};

const expressionSources = {
  siteSettings,
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
    expressionSources
  );
  expect(transformedProps).toEqual({
    foo: "hello world",
    bar: "${document.name}",
    buzz: "siteSettings.apiKey",
  });
});

it("logs a warning when transformed value type doesn't match from the expected type", () => {
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  const transformedProps = getPreviewProps(
    {
      foo: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.number,
        value: "siteSettings.isDevMode",
      },
    },
    expressionSources
  );
  expect(transformedProps).toEqual({
    foo: "siteSettings.isDevMode",
  });
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    `Invalid expression prop value: ${siteSettings.isDevMode}. The value extracted from the expression` +
      ` "siteSettings.isDevMode" does not match with the expected propType ${PropValueType.number}.`
  );
});

describe("expression value handling", () => {
  it("returns transformed value sourced from site settings", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "siteSettings.apiKey",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: siteSettings.apiKey,
    });
  });

  it("returns value as is when the expression reference an unknown source", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "unknownSource.city",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: "unknownSource.city",
    });
  });
});

describe("template string literal value handling", () => {
  it("returns value as is when template string contain no expression", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`hello world`",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: "hello world",
    });
  });

  it("returns transformed value when template string contain one expression", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`${siteSettings.apiKey}`",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: `${siteSettings.apiKey}`,
    });
  });

  it("returns transformed value when template string contain multiple expressions", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value:
            "`1 ${siteSettings.locale} document.name ${siteSettings.apiKey}`",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: `1 ${siteSettings.locale} document.name ${siteSettings.apiKey}`,
    });
  });

  it("returns value as is when the template string contains unknown expression source reference", () => {
    const transformedProps = getPreviewProps(
      {
        foo: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`1 ${unknownSource.city} 2`",
        },
      },
      expressionSources
    );
    expect(transformedProps).toEqual({
      foo: "1 ${unknownSource.city} 2",
    });
  });
});
