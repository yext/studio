import { PropValueKind } from "../../lib";
import GetPathParser from "../../src/parsers/GetPathParser";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import createTestSourceFile from "../__utils__/createTestSourceFile";

describe("parseGetPathValue", () => {
  describe("getPath arrow function", () => {
    it("can parse directly returned string literal", () => {
      const parser = createParser('const getPath = () => "index.html";');
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Literal,
        value: "index.html",
      });
    });

    it("can parse string literal wrapped in parens", () => {
      const parser = createParser('const getPath = () => (("index.html"));');
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Literal,
        value: "index.html",
      });
    });

    it("can parse string literal returned in function block", () => {
      const parser = createParser(
        'const getPath = () => { return "index.html"; };'
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Literal,
        value: "index.html",
      });
    });
  });

  describe("getPath function declaration", () => {
    it("can parse string literal returned in function block", () => {
      const parser = createParser(
        'function getPath() { return "index.html"; };'
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Literal,
        value: "index.html",
      });
    });

    it("can parse parens-wrapped string literal returned in function block", () => {
      const parser = createParser(
        'function getPath() { return (("index.html")); };'
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Literal,
        value: "index.html",
      });
    });

    it("can parse returned unsubstituted template literal", () => {
      const parser = createParser(
        "const getPath = ({ document }) => { return `index.html`; };"
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Expression,
        value: "`index.html`",
      });
    });

    it("can parse returned template expression", () => {
      const parser = createParser(
        "const getPath = ({ document }) => { return `test-${document.slug}`; };"
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Expression,
        value: "`test-${document.slug}`",
      });
    });

    it("can parse returned property access expression", () => {
      const parser = createParser(
        "const getPath = ({ document }) => { return document.slug; };"
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Expression,
        value: "document.slug",
      });
    });

    it("can parse returned element access expression", () => {
      const parser = createParser(
        "const getPath = ({ document }) => { return document.services[0]; };"
      );
      expect(parser.parseGetPathValue()).toEqual({
        kind: PropValueKind.Expression,
        value: "document.services[0]",
      });
    });
  });

  describe("undefined cases", () => {
    it("returns undefined if the return statement is not a string literal or expression", () => {
      const parser = createParser(
        `const getPath = ({ document }) => {
          return document.slug ?? document.id.toString();
        };`
      );
      expect(parser.parseGetPathValue()).toBeUndefined();
    });

    it("returns undefined if there is no single, top-level return statement", () => {
      const parser = createParser(
        `const getPath = ({ document }) => {
          if (document) {
            return "entity.html";
          } else {
            return "index.html";
          }
        };`
      );
      expect(parser.parseGetPathValue()).toBeUndefined();
    });
  });

  describe("error cases", () => {
    it("throws an error if no getPath variable is found", () => {
      const parser = createParser('const path = () => "index.html";');
      expect(() => parser.parseGetPathValue()).toThrowError(
        "Error parsing getPath value: no getPath function found."
      );
    });

    it("throws an error if getPath variable is not a function", () => {
      const parser = createParser('const getPath = "index.html";');
      expect(() => parser.parseGetPathValue()).toThrowError(
        "Error parsing getPath value: no getPath function found."
      );
    });
  });
});

function createParser(code: string) {
  const { project } = createTestSourceFile(code);
  const sourceFileParser = new StudioSourceFileParser("test.tsx", project);
  return new GetPathParser(sourceFileParser);
}
