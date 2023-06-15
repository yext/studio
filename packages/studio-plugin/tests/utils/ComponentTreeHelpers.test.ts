import {
  ComponentState,
  ComponentStateKind,
} from "../../src/types/ComponentState";
import {
  PropValueKind,
  PropValues,
  PropValueType,
} from "../../src/types/PropValues";
import ComponentTreeHelpers from "../../src/utils/ComponentTreeHelpers";

describe("usesExpressionSource", () => {
  it("matches template string usages", () => {
    const componentTree = createComponentTree({
      documentUsage: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "`doc usage ${document.aDocUsage}`",
      },
    });
    expect(
      ComponentTreeHelpers.usesExpressionSource(componentTree, "document")
    ).toBeTruthy();
  });

  it("matches template string usages without a path", () => {
    const componentTree = createComponentTree({
      documentUsage: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "`doc usage ${document}`",
      },
    });
    expect(
      ComponentTreeHelpers.usesExpressionSource(componentTree, "document")
    ).toBeTruthy();
  });

  it("matches repeater list expression", () => {
    const componentTree: ComponentState[] = [
      {
        kind: ComponentStateKind.Repeater,
        uuid: "-uuid-",
        listExpression: "document.someList",
        repeatedComponent: {
          kind: ComponentStateKind.Standard,
          componentName: "-componentName-",
          metadataUUID: "-metadatUUID-",
          props: {},
        },
      },
    ];
    expect(
      ComponentTreeHelpers.usesExpressionSource(componentTree, "document")
    ).toBeTruthy();
  });

  it("matches expression within object literal", () => {
    const componentTree = createComponentTree({
      documentUsage: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          title: {
            kind: PropValueKind.Expression,
            valueType: PropValueType.string,
            value: "document.name",
          },
        },
      },
    });
    expect(
      ComponentTreeHelpers.usesExpressionSource(componentTree, "document")
    ).toBeTruthy();
  });

  it("matches expression within array literal", () => {
    const componentTree = createComponentTree({
      documentUsage: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Expression,
            valueType: PropValueType.string,
            value: "document.name",
          },
        ],
      },
    });
    expect(
      ComponentTreeHelpers.usesExpressionSource(componentTree, "document")
    ).toBeTruthy();
  });
});

function createComponentTree(props: PropValues) {
  const componentTree: ComponentState[] = [
    {
      kind: ComponentStateKind.Standard,
      props,
      componentName: "-componentName-",
      uuid: "-uuid-",
      metadataUUID: "-metadatUUID-",
    },
  ];
  return componentTree;
}
