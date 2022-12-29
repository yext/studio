import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ComponentEditor from "../../src/components/ComponentEditor";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropShape,
  PropValueKind,
  PropValueType,
  PropValues,
  StandardOrModuleComponentState,
} from "@yext/studio-plugin";
import useStudioStore from "../../src/store/useStudioStore";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";

const activeComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "banner-uuid",
  metadataUUID: "banner-metadata-uuid",
};

const activeComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "banner-metadata-uuid",
  filepath: "mock-filepath",
};

const propShape: PropShape = {
  title: { type: PropValueType.string },
  num: { type: PropValueType.number },
  bool: { type: PropValueType.boolean },
  bgColor: { type: PropValueType.HexColor },
};

it("does not render a prop editor for component's prop of type ReactNode", () => {
  mockStoreActiveComponent({
    activeComponent: activeComponentState,
    activeComponentMetadata: {
      ...activeComponentMetadata,
      propShape: {
        titleNode: {
          type: PropValueType.ReactNode,
        },
      },
    },
  });
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  render(<ComponentEditor />);
  expect(screen.queryByText("titleNode")).toBeNull();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Found titleNode in component Banner with PropValueType.ReactNode. Studio does not support editing prop of type ReactNode."
  );
});

it("does not render prop editor(s) for fragment component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
  });
  const { container } = render(<ComponentEditor />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render prop editor(s) for builtin component", () => {
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.BuiltIn,
      componentName: "div",
      props: {},
      uuid: "builtin-uuid",
    },
  });
  const { container } = render(<ComponentEditor />);
  expect(container).toBeEmptyDOMElement();
});

it("does not render prop editor(s) when there's no selected active component", () => {
  mockStoreActiveComponent({});
  const { container } = render(<ComponentEditor />);
  expect(container).toBeEmptyDOMElement();
});

describe("ComponentStateKind.Module", () => {
  const activeModuleState: ComponentState = {
    kind: ComponentStateKind.Module,
    componentName: "ModuleBanner",
    props: {},
    uuid: "modulebanner-uuid",
    metadataUUID: "modulebanner-metadata-uuid",
  };

  const activeModuleMetadata: FileMetadata = {
    kind: FileMetadataKind.Module,
    metadataUUID: "modulebanner-metadata-uuid",
    filepath: "mock-filepath",
    componentTree: [],
  };
  testStandardOrModuleComponentState(activeModuleState, activeModuleMetadata);
});

describe("ComponentStateKind.Component", () => {
  testStandardOrModuleComponentState(
    activeComponentState,
    activeComponentMetadata
  );
});

function testStandardOrModuleComponentState(
  state: StandardOrModuleComponentState,
  metadata: FileMetadata
) {
  const componentKindLabel =
    state.kind === ComponentStateKind.Standard ? "component" : "module";

  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: state,
      activeComponentMetadata: {
        ...metadata,
        propShape,
      },
    });
  });

  it(`renders prop editors for each of the active ${componentKindLabel}'s props`, () => {
    render(<ComponentEditor />);
    expect(screen.getByLabelText("title")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("num")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("bool")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("bgColor")).toHaveAttribute("type", "color");
  });

  it(`updates active ${componentKindLabel}'s prop state correctly through prop editors`, async () => {
    render(<ComponentEditor />);
    const getComponentProps = () =>
      (
        useStudioStore
          .getState()
          .pages.getActiveComponentState() as StandardOrModuleComponentState
      ).props;

    expect(getComponentProps()).toEqual({});
    await userEvent.type(screen.getByLabelText("title"), "test!");
    await userEvent.type(screen.getByLabelText("num"), "10");
    await userEvent.click(screen.getByLabelText("bool"));
    // userEvent doesn't support interaction with input of type "color"
    fireEvent.input(screen.getByLabelText("bgColor"), {
      target: { value: "#abcdef" },
    });
    const expectedComponentProps: PropValues = {
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "test!",
      },
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 10,
      },
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: true,
      },
      bgColor: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.HexColor,
        value: "#abcdef",
      },
    };
    expect(getComponentProps()).toEqual(expectedComponentProps);
  });
}
