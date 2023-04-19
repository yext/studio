import { SyntaxKind } from "ts-morph";
import RepeaterParsingHelpers from "../../src/parsers/helpers/RepeaterParsingHelpers";
import createTestSourceFile from "../__utils__/createTestSourceFile";

it("can unwrap parens and ignore extra logic around repeated JSX", () => {
  const { sourceFile } = createTestSourceFile(
    `function Test() {
      return (<>{myList.map((item, index) => {
        window.performance.mark(index);
        return ((<Banner key={index} />));
      })}</>)
    }`
  );
  const jsxExpression = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.JsxExpression
  );
  const expectedSelfClosingEl = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.JsxSelfClosingElement
  );
  expect(RepeaterParsingHelpers.parseMapExpression(jsxExpression)).toEqual({
    selfClosingElement: expectedSelfClosingEl,
    listExpression: "myList",
  });
});

it('throws an error if mapped item is not called "item"', () => {
  const { sourceFile } = createTestSourceFile(
    `function Test() { return <>{myList.map(s => <Banner title={s} />)}</> }`
  );
  const jsxExpression = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.JsxExpression
  );
  expect(() =>
    RepeaterParsingHelpers.parseMapExpression(jsxExpression)
  ).toThrowError(
    'Error parsing map expression: name of item being mapped must be "item". Found s.'
  );
});

it("throws an error if repeated JSX is not a self-closing element", () => {
  const { sourceFile } = createTestSourceFile(
    `function Test() { return <>{myList.map(() => (<div>Text</div>))}</> }`
  );
  const jsxExpression = sourceFile.getFirstDescendantByKindOrThrow(
    SyntaxKind.JsxExpression
  );
  expect(() =>
    RepeaterParsingHelpers.parseMapExpression(jsxExpression)
  ).toThrowError(
    /^Error parsing map expression: function must return a single self-closing JSX element with no children./
  );
});
