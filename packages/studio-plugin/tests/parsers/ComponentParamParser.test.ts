import ComponentParamParser from "../../src/parsers/ComponentParamParser";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import { ParsingErrorType } from "../../src/types/errors/ParsingError";
import createTestSourceFile from "../__utils__/createTestSourceFile";

describe("can parse the prop interface name for a component", () => {
  const cases = {
    "default export named function":
      "export default function MyComponent(props: MyProps) {};",
    "anonymous default export": "export default function(props: MyProps) {};",
    "arrow function":
      "const MyComponent = (props: MyProps) => {}; export default MyComponent;",
    "const function declaration":
      "function MyComponent(props: MyProps) {}; export default MyComponent;",
  };

  Object.keys(cases).forEach((title) => {
    // eslint-disable-next-line jest/valid-title
    it(title, () => {
      const parser = createParser(cases[title]);
      const parseParamNameResult = parser.parseParamName();
      expect(parseParamNameResult.isOk).toBe(true);
      parseParamNameResult.map((paramName) =>
        paramName.mapOrElse(
          () => {
            throw new Error("Prop Name should be present");
          },
          (name) => expect(name).toBe("MyProps")
        )
      );
    });
  });
});

describe("error cases", () => {
  it("does not support anonymous arrow function exports", () => {
    const parser = createParser("export default (props: MyProps) => {};");
    expect(() => parser.parseParamName()).toThrow(
      /Could not find a child of kind/
    );
  });

  it("throws when multiple parameters are found", () => {
    const parser = createParser(
      "export default function MyComp(first: First, second: Second) => {};"
    );

    expect(parser.parseParamName().toJSON()).toEqual({
      variant: "Err",
      error: {
        name: ParsingErrorType.InvalidComponentSignature,
        message:
          "Functional components may contain at most one parameter, found 2 at test.tsx",
      },
    });
  });
});

function createParser(code: string) {
  const { project } = createTestSourceFile(code);
  const sourceFileParser = new StudioSourceFileParser("test.tsx", project);
  return new ComponentParamParser(sourceFileParser);
}
