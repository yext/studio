/* eslint-disable no-template-curly-in-string */
import ExpressionFormatter from "../../src/utils/ExpressionFormatter";

const rawTemplateString = "`hi ${document.address} ${document.cat} bye`";
const displayValue = "hi [[address]] [[cat]] bye";

it("converts raw expression values into display values correctly", () => {
  const actualValue =
    ExpressionFormatter.getTemplateStringDisplayValue(rawTemplateString);
  expect(actualValue).toEqual(displayValue);
});

it("converts square brackets back to curly braces", () => {
  const actualValue = ExpressionFormatter.getRawValue(displayValue);
  expect(actualValue).toEqual(rawTemplateString);
});
