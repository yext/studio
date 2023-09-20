/* eslint-disable no-template-curly-in-string */
import TemplateExpressionFormatter from "../../src/utils/TemplateExpressionFormatter";

const rawTemplateString = "`hi ${document.address} ${document.cats[0]} bye`";
const displayValue = "hi [[address]] [[cats[0]]] bye";

it("converts raw expression values into display values correctly", () => {
  const actualValue =
    TemplateExpressionFormatter.getTemplateStringDisplayValue(
      rawTemplateString
    );
  expect(actualValue).toEqual(displayValue);
});

it("converts square brackets back to curly braces", () => {
  const actualValue = TemplateExpressionFormatter.getRawValue(displayValue);
  expect(actualValue).toEqual(rawTemplateString);
});
