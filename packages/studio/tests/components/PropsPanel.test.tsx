import { ComponentStateKind } from "@yext/studio-plugin";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import PropsPanel from "../../src/components/PropsPanel";
import { render } from "@testing-library/react";

it("does not render prop editor(s) for fragment component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
  });
  const { container } = render(<PropsPanel />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render prop editor(s) when there's no selected active component", () => {
  mockStoreActiveComponent({});
  const { container } = render(<PropsPanel />);
  expect(container).toBeEmptyDOMElement();
});
