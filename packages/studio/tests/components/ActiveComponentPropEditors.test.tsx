import { act, fireEvent, render, screen } from "@testing-library/react";
import ActiveComponentPropEditors from "../../src/components/ActiveComponentPropEditors";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
  StandardOrModuleComponentState,
  TypeGuards,
  ValidFileMetadata,
} from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import useActiveComponent from "../../src/hooks/useActiveComponent";
import mockStore from "../__utils__/mockStore";

const activeComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "banner-uuid",
  metadataUUID: "banner-metadata-uuid",
};

it("does not render a prop editor for component's prop of type ReactNode", () => {
  const propShape: PropShape = {
    titleNode: {
      type: PropValueType.ReactNode,
      required: false,
    },
  };
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  render(
    <ActiveComponentPropEditors
      activeComponentState={activeComponentState}
      propShape={propShape}
    />
  );
  expect(screen.queryByText("titleNode")).toBeNull();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Found titleNode in component Banner with PropValueType.ReactNode. Studio does not support editing prop of type ReactNode."
  );
});

it("renders nested prop editors for component's prop of type Object", () => {
  const propShape: PropShape = {
    objProp: {
      type: PropValueType.Object,
      required: false,
      shape: {
        title: {
          type: PropValueType.string,
          required: false,
        },
      },
    },
  };
  render(
    <ActiveComponentPropEditors
      activeComponentState={activeComponentState}
      propShape={propShape}
    />
  );
  expect(screen.getByText("objProp")).toBeTruthy();
  expect(screen.getByText("title")).toBeTruthy();
});

const activeComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "banner-metadata-uuid",
  filepath: "mock-filepath",
};

const propShape: PropShape = {
  title: { type: PropValueType.string, required: false },
  num: { type: PropValueType.number, required: false },
  bool: { type: PropValueType.boolean, required: false },
  bgColor: { type: PropValueType.HexColor, required: false },
};

const getComponentProps = () =>
  (
    useStudioStore
      .getState()
      .actions.getActiveComponentState() as StandardOrModuleComponentState
  ).props;

describe("ComponentStateKind.Component", () => {
  testStandardOrModuleComponentState(
    activeComponentState,
    activeComponentMetadata
  );
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

function testStandardOrModuleComponentState(
  state: StandardOrModuleComponentState,
  metadata: ValidFileMetadata
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

  it(`renders message when there are no editable props`, () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={state}
        propShape={propShape}
        shouldRenderProp={() => false}
      />
    );

    screen.getByText(
      `${state.componentName} has no Editable Properties in this Panel.`
    );
    expect(screen.queryByText("title")).toBeNull();
    expect(screen.queryByText("num")).toBeNull();
    expect(screen.queryByText("bool")).toBeNull();
    expect(screen.queryByText("bgColor")).toBeNull();
  });

  it(`renders prop editors for each of the active ${componentKindLabel}'s non string props`, () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={state}
        propShape={propShape}
      />
    );
    expect(screen.getByLabelText("title")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("num")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("bool")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("bgColor")).toHaveAttribute("type", "color");
  });

  describe(`updates active ${componentKindLabel}'s prop state correctly through prop editors`, () => {
    function PropEditorsWithActiveState() {
      const { activeComponentMetadata, activeComponentState } =
        useActiveComponent();
      if (
        activeComponentMetadata?.kind === FileMetadataKind.Error ||
        !activeComponentMetadata?.propShape ||
        !activeComponentState ||
        !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
      ) {
        return null;
      }
      return (
        <ActiveComponentPropEditors
          activeComponentState={activeComponentState}
          propShape={activeComponentMetadata.propShape}
        />
      );
    }
    const activeComponent: ComponentState = {
      ...state,
      props: {
        title: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: "",
        },
        num: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.number,
          value: 0,
        },
        bool: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: false,
        },
        bgColor: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.HexColor,
          value: "#ffffff",
        },
      },
    };

    beforeEach(() => {
      mockStoreActiveComponent({
        activeComponent: activeComponent,
        activeComponentMetadata: {
          ...metadata,
          propShape,
        },
      });
    });

    it("string prop", async () => {
      render(<PropEditorsWithActiveState />);
      await userEvent.type(screen.getByLabelText("title"), "test!");
      expect(getComponentProps()).toEqual({
        ...activeComponent.props,
        title: {
          ...activeComponent.props.title,
          kind: PropValueKind.Expression,
          value: "`test!`",
        },
      });
    });

    it("number prop", async () => {
      render(<PropEditorsWithActiveState />);
      await userEvent.type(screen.getByLabelText("num"), "10");
      expect(getComponentProps()).toEqual({
        ...activeComponent.props,
        num: {
          ...activeComponent.props.num,
          value: 10,
        },
      });
    });

    it("boolean prop", async () => {
      render(<PropEditorsWithActiveState />);
      await userEvent.click(screen.getByLabelText("bool"));
      expect(getComponentProps()).toEqual({
        ...activeComponent.props,
        bool: {
          ...activeComponent.props.bool,
          value: true,
        },
      });
    });

    it("hex color prop", async () => {
      jest.useFakeTimers();
      render(<PropEditorsWithActiveState />);

      fireEvent.input(screen.getByLabelText("bgColor"), {
        target: { value: "#abcdef" },
      });
      await screen.findByDisplayValue("#abcdef");
      act(() => jest.advanceTimersByTime(100)); //debounce time

      expect(getComponentProps()).toEqual({
        ...activeComponent.props,
        bgColor: {
          ...activeComponent.props.bgColor,
          value: "#abcdef",
        },
      });
      jest.useRealTimers();
    });
  });
}

it("converts string literals to string expressions when propKind = Expression", async () => {
  const props: PropValues = {
    title: {
      kind: PropValueKind.Literal,
      value: "myTitle",
      valueType: PropValueType.string,
    },
  };

  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "MyComponent",
      props,
      uuid: "mock-uuid",
      metadataUUID: "mock-metadataUUID",
    },
  });

  const propShape: PropShape = {
    title: {
      type: PropValueType.string,
      required: false,
    },
  };

  render(
    <ActiveComponentPropEditors
      activeComponentState={{
        ...activeComponentState,
        props,
      }}
      propShape={propShape}
    />
  );

  await userEvent.type(screen.getByLabelText("title"), "a");

  expect(getComponentProps()).toEqual({
    title: {
      kind: PropValueKind.Expression,
      valueType: PropValueType.string,
      value: "`myTitlea`",
    },
  });
});

it("converts non-template string expressions to template literals", () => {
  const props: PropValues = {
    title: {
      kind: PropValueKind.Expression,
      value: "siteSettings.siteName",
      valueType: PropValueType.string,
    },
  };
  const propShape: PropShape = {
    title: {
      type: PropValueType.string,
      required: false,
    },
  };

  render(
    <ActiveComponentPropEditors
      activeComponentState={{
        ...activeComponentState,
        props,
      }}
      propShape={propShape}
    />
  );
  expect(screen.getByText("title")).toBeDefined();
  expect(screen.getByRole("textbox")).toHaveValue("${siteSettings.siteName}");
});

it("correctly updates Array prop value using field picker", async () => {
  mockStore({ pages: { activeEntityData: { strings: [], words: [] } } });
  const props: PropValues = {
    arr: {
      kind: PropValueKind.Expression,
      value: "document.strings",
      valueType: PropValueType.Array,
    },
  };
  mockStoreActiveComponent({
    activeComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "MyComponent",
      props,
      uuid: "mock-uuid",
      metadataUUID: "mock-metadataUUID",
    },
  });
  const propShape: PropShape = {
    arr: {
      type: PropValueType.Array,
      itemType: {
        type: PropValueType.string,
      },
      required: false,
    },
  };
  render(
    <ActiveComponentPropEditors
      activeComponentState={{
        ...activeComponentState,
        props,
      }}
      propShape={propShape}
    />
  );

  expect(screen.getByRole("textbox")).toHaveValue("document.strings");
  await userEvent.click(screen.getByRole("button"));
  await userEvent.click(screen.getByText("Words"));
  expect(getComponentProps()).toEqual({
    arr: {
      kind: PropValueKind.Expression,
      valueType: PropValueType.Array,
      value: "document.words",
    },
  });
});
