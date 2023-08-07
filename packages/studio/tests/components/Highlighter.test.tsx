import { ComponentStateKind } from "@yext/studio-plugin";
import mockActiveComponentState from "../__utils__/mockActiveComponentState";
import { render, screen } from "@testing-library/react";
import Highlighters from "../../src/components/Highlighters";
import mockStore from "../__utils__/mockStore";

it("displays the active component name", () => {
  mockActiveComponentState({
    activeComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "Banner",
      props: {},
      uuid: "uuid",
      metadataUUID: "metadataUUID",
    },
  });
  mockStore({
    pages: {
      selectedComponentRects: [
        {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      ],
    },
  });
  render(<Highlighters />);

  expect(screen.getByText("Banner")).toBeTruthy();
});
