import PropInterfaceNameParser from "../../src/parsers/PropInterfaceNameParser";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
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
      expect(parser.parsePropInterfaceName()).toEqual("MyProps");
    });
  });
});

describe("error cases", () => {
  it("does not support anonymous arrow function exports", () => {
    const parser = createParser("export default (props: MyProps) => {};");
    expect(() => parser.parsePropInterfaceName()).toThrow(
      /Could not find a child of kind/
    );
  });

  it("throws when multiple parameters are found", () => {
    const parser = createParser(
      "export default function MyComp(first: First, second: Second) => {};"
    );
    expect(() => parser.parsePropInterfaceName()).toThrow(
      /Function components may contain at most one parameter, found 2/
    );
  });
});

function createParser(code: string) {
  const { project } = createTestSourceFile(code);
  const sourceFileParser = new StudioSourceFileParser("test.tsx", project);
  return new PropInterfaceNameParser(sourceFileParser);
}
