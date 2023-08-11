import {
  ComponentStateKind,
  StandardComponentState,
} from "@yext/studio-plugin";
import mockActiveComponentState from "../__utils__/mockActiveComponentState";
import mockComponentTree from "../__utils__/mockComponentTree";
import { render, screen } from "@testing-library/react";
import Highlighters from "../../src/components/Highlighters";
import mockStore from "../__utils__/mockStore";
import {
  nestedComponentTree,
  mockUUIDToFileMetadata,
} from "../__fixtures__/mockStoreNestedComponents";
import { domRect } from "../__utils__/helpers";

const activeComponent: StandardComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "uuid",
  metadataUUID: "metadataUUID",
};

it("displays the active component name label", () => {
  mockActiveComponentState({
    activeComponent: activeComponent,
  });
  mockStore({
    pages: {
      selectedComponentRectsMap: {
        "uuid":
        {
          x: 0,
          y: 0,
          width: 10,
          height: 10,
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
    },
  });
  render(<Highlighters iframeEl={null} />);

  expect(screen.getByText("Banner")).toBeTruthy();
});

it("displays component name labels for multiple selected components", () => {
  const selectedRectsMap = {
    "banner-uuid-1": domRect(1, 1, 1, 1),
    "banner-uuid-2": domRect(1, 2, 1, 1),
    "container-uuid-1": domRect(2, 1, 1, 1),
    "container-uuid-2": domRect(2, 2, 1, 1),
  };
  mockComponentTree({
    componentTree: nestedComponentTree,
    UUIDToFileMetadata: mockUUIDToFileMetadata,
    activeComponentUUID: nestedComponentTree[0].uuid,
    selectedComponentUUIDs: new Set(nestedComponentTree.map((c) => c.uuid)),
    selectedComponentRectsMap: selectedRectsMap,
  });
  render(<Highlighters iframeEl={null} />);

  expect(screen.getAllByText("Banner")).toHaveLength(2);
  expect(screen.getAllByText("Container")).toHaveLength(2);
});
