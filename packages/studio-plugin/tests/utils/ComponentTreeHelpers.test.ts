import { ComponentState, ComponentStateKind } from "../../src/types/ComponentState"
import { PropValueKind, PropValueType } from "../../src/types/PropValues"
import ComponentTreeHelpers from "../../src/utils/ComponentTreeHelpers"

it('usesExpressionSource', () => {
  const componentTree: ComponentState[] = [
    {
      kind: ComponentStateKind.Standard,
      props: {
        documentUsage: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: '`doc usage ${document.aDocUsage}`'
        }
      },
      componentName: '-componentName-',
      uuid: '-uuid-',
      metadataUUID: '-metadatUUID-'
    }
  ]
  expect(ComponentTreeHelpers.usesExpressionSource(componentTree, "document")).toBeTruthy();
})