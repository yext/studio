import { act, fireEvent, render, screen } from "@testing-library/react";
import ActiveComponentPropEditors from "../../src/components/ActiveComponentPropEditors";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropShape,
  PropVal,
  PropValueKind,
  PropValues,
  PropValueType,
  StandardComponentState,
} from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import useActiveComponent from "../../src/hooks/useActiveComponent";
import mockStore from "../__utils__/mockStore";
import { checkTooltipFunctionality } from "../__utils__/helpers";

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

const activeComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "banner-metadata-uuid",
  filepath: "mock-filepath",
  cssImports: [],
};

const propShape: PropShape = {
  title: {
    type: PropValueType.string,
    required: false,
    tooltip: "this is a title",
  },
  num: { type: PropValueType.number, required: false },
  bool: { type: PropValueType.boolean, required: false },
  bgColor: { type: PropValueType.HexColor, required: false },
};

const getComponentProps = () =>
  (
    useStudioStore
      .getState()
      .actions.getActiveComponentState() as StandardComponentState
  ).props;

describe("ComponentStateKind.Component", () => {
  const componentKindLabel = "component";
  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: activeComponentState,
      activeComponentMetadata: {
        ...activeComponentMetadata,
        propShape,
      },
    });
  });

  it(`renders message when there are no editable props`, () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={activeComponentState}
        propShape={propShape}
        shouldRenderProp={() => false}
      />
    );

    screen.getByText(
      `${activeComponentState.componentName} has no Editable Properties in this Panel.`
    );
    expect(screen.queryByText("title")).toBeNull();
    expect(screen.queryByText("num")).toBeNull();
    expect(screen.queryByText("bool")).toBeNull();
    expect(screen.queryByText("bgColor")).toBeNull();
  });

  it(`renders prop editors for each of the active ${componentKindLabel}'s non string props`, () => {
    const activeState: StandardComponentState = {
      ...activeComponentState,
      props: {
        bgColor: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.HexColor,
          value: "#ffffff",
        },
      },
    };
    render(
      <ActiveComponentPropEditors
        activeComponentState={activeState}
        propShape={propShape}
      />
    );
    expect(screen.getByLabelText("title")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("num")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("bool")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("bgColor")).toHaveAttribute("type", "color");
  });

  it(`renders tooltip for each of the active ${componentKindLabel}'s props with docs`, async () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={activeComponentState}
        propShape={propShape}
      />
    );
    await checkTooltipFunctionality(
      "this is a title",
      screen.getByText("title")
    );
  });

  describe(`updates active ${componentKindLabel}'s prop state correctly through prop editors`, () => {
    function PropEditorsWithActiveState() {
      const { activeComponentMetadata, activeComponentState } =
        useActiveComponent();
      if (
        activeComponentMetadata?.kind === FileMetadataKind.Error ||
        !activeComponentMetadata?.propShape ||
        !activeComponentState ||
        activeComponentState?.kind !== ComponentStateKind.Standard
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
    const activeComponent: StandardComponentState = {
      ...activeComponentState,
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
          ...activeComponentMetadata,
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
});

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

describe("Array prop", () => {
  const expressionPropVal: PropVal = {
    kind: PropValueKind.Expression,
    value: "document.strings",
    valueType: PropValueType.Array,
  };
  const literalPropVal: PropVal = {
    kind: PropValueKind.Literal,
    valueType: PropValueType.Array,
    value: [
      {
        kind: PropValueKind.Expression,
        valueType: PropValueType.string,
        value: "document.name",
      },
    ],
  };
  const propShape: PropShape = {
    arr: {
      type: PropValueType.Array,
      itemType: {
        type: PropValueType.string,
      },
      required: false,
      tooltip: "this is an array item",
    },
  };

  function renderWrapper() {
    render(<ActiveComponentPropEditorsWrapper propShape={propShape} />);
  }

  it("correctly updates expression value using field picker", async () => {
    mockStore({
      pages: {
        activeEntityFile: "entityFile.json",
        activePageEntities: { "entityFile.json": { strings: [], words: [] } },
      },
    });
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: expressionPropVal },
      },
    });
    renderWrapper();

    expect(screen.getByRole("textbox")).toHaveValue("document.strings");
    await userEvent.click(
      screen.getByRole("button", { name: "Toggle field picker" })
    );
    await userEvent.click(screen.getByText("Words"));
    expect(getComponentProps()).toEqual({
      arr: {
        kind: PropValueKind.Expression,
        valueType: PropValueType.Array,
        value: "document.words",
      },
    });
    expect(screen.getByRole("textbox")).toHaveValue("document.words");
  });

  it("correctly switches to literal editor using Add Item button", async () => {
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: expressionPropVal },
      },
    });
    renderWrapper();

    const expressionInput = screen.getByRole("textbox");
    await userEvent.click(screen.getByRole("button", { name: "Add Item" }));
    expect(expressionInput).toHaveValue("");
    expect(expressionInput).toBeDisabled();
    expect(getComponentProps()).toEqual({
      arr: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Literal,
            valueType: PropValueType.string,
            value: "",
          },
        ],
      },
    });
    expect(screen.getByRole("textbox", { name: "Item 1" })).toHaveValue("");
  });

  it("correctly adds item to existing literal value", async () => {
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: literalPropVal },
      },
    });
    renderWrapper();

    await userEvent.click(screen.getByRole("button", { name: "Add Item" }));
    expect(getComponentProps()).toEqual({
      arr: {
        ...literalPropVal,
        value: [
          ...literalPropVal.value,
          {
            kind: PropValueKind.Literal,
            valueType: PropValueType.string,
            value: "",
          },
        ],
      },
    });
    expect(screen.getByRole("textbox", { name: "Item 1" })).toHaveValue(
      "[[name]]"
    );
    expect(screen.getByRole("textbox", { name: "Item 2" })).toHaveValue("");
  });

  it("correctly removes item when there are multiple", async () => {
    const propVal: PropVal = {
      ...literalPropVal,
      value: [
        {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "document.title",
        },
        ...literalPropVal.value,
      ],
    };
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: propVal },
      },
    });
    renderWrapper();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Item 1" })
    );
    expect(getComponentProps()).toEqual({ arr: literalPropVal });
    expect(screen.getByRole("textbox", { name: "Item 1" })).toHaveValue(
      "[[name]]"
    );
    expect(screen.queryByRole("textbox", { name: "Item 2" })).toBeNull();
    const expressionInput = screen.getByRole("textbox", {
      name: (text) => text.startsWith("arr"),
    });
    expect(expressionInput).toHaveValue("");
    expect(expressionInput).toBeDisabled();
  });

  it("correctly removes item when there is only one", async () => {
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: literalPropVal },
      },
    });
    renderWrapper();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove Item 1" })
    );
    expect(getComponentProps()).toEqual({
      arr: {
        ...literalPropVal,
        value: [],
      },
    });
    expect(screen.queryByRole("textbox", { name: "Item 1" })).toBeNull();
    const expressionInput = screen.getByRole("textbox");
    expect(expressionInput).toHaveValue("");
    expect(expressionInput).toBeEnabled();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("correctly creates different tooltips for two array items with the same name", async () => {
    mockStoreActiveComponent({
      activeComponent: {
        ...activeComponentState,
        props: { arr: literalPropVal, secondArr: literalPropVal },
      },
    });
    const twoArrayPropShape: PropShape = {
      arr: {
        type: PropValueType.Array,
        itemType: {
          type: PropValueType.string,
        },
        required: false,
        tooltip: "this is an array item",
      },
      secondArr: {
        type: PropValueType.Array,
        itemType: {
          type: PropValueType.string,
        },
        required: false,
        tooltip: "this is another array item",
      },
    };
    render(<ActiveComponentPropEditorsWrapper propShape={twoArrayPropShape} />);
    const propLabels = screen.getAllByText("Item 1");
    await checkTooltipFunctionality("this is an array item", propLabels[0]);
    await checkTooltipFunctionality(
      "this is another array item",
      propLabels[1]
    );
  });
});

describe("Nested prop", () => {
  const objPropShape: PropShape = createObjPropShape(
    "objProp",
    "this is a title"
  );
  const objState: StandardComponentState = {
    ...activeComponentState,
    props: {
      objProp: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          title: {
            kind: PropValueKind.Expression,
            value: "test",
            valueType: PropValueType.string,
          },
        },
      },
    },
  };

  it("renders nested prop editors for component's prop of type Object", () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={objState}
        propShape={objPropShape}
      />
    );
    expect(screen.getByText("objProp")).toBeTruthy();
    expect(screen.getByText("title")).toBeTruthy();
  });

  it("correctly creates different tooltips for object subfields with the same name", async () => {
    const objPropShapeTwo: PropShape = createObjPropShape(
      "objPropTwo",
      "this is another title"
    );
    const twoObjState: StandardComponentState = {
      ...activeComponentState,
      props: {
        ...objState.props,
        objPropTwo: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            title: {
              kind: PropValueKind.Expression,
              value: "test-two",
              valueType: PropValueType.string,
            },
          },
        },
      },
    };
    render(
      <ActiveComponentPropEditors
        activeComponentState={twoObjState}
        propShape={{ ...objPropShape, ...objPropShapeTwo }}
      />
    );
    const propLabels = screen.getAllByText("title");
    await checkTooltipFunctionality("this is a title", propLabels[0]);
    await checkTooltipFunctionality("this is another title", propLabels[1]);
  });

  it("renders empty curly braces for an undefined nested prop", () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={activeComponentState}
        propShape={objPropShape}
      />
    );
    expect(screen.getByText("objProp")).toBeTruthy();
    expect(screen.getByText("{}")).toBeTruthy();
    expect(screen.queryByText("title")).toBeNull();
  });
});

describe("undefined menu", () => {
  const propShape: PropShape = {
    bool: {
      type: PropValueType.boolean,
      required: false,
    },
  };
  const state: StandardComponentState = {
    ...activeComponentState,
    props: {
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: true,
      },
    },
  };

  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: state,
      activeComponentMetadata: {
        ...activeComponentMetadata,
        propShape,
      },
    });
  });

  it("renders icon for optional prop", () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={state}
        propShape={propShape}
      />
    );
    expect(screen.getByLabelText("Toggle undefined value menu")).toBeDefined();
  });

  it("does not render icon for required prop", () => {
    const propShape: PropShape = {
      bool: {
        type: PropValueType.boolean,
        required: true,
      },
    };
    mockStoreActiveComponent({
      activeComponent: state,
      activeComponentMetadata: {
        ...activeComponentMetadata,
        propShape,
      },
    });
    render(
      <ActiveComponentPropEditors
        activeComponentState={state}
        propShape={propShape}
      />
    );
    expect(screen.queryByLabelText("Toggle undefined value menu")).toBeFalsy();
  });

  it("sets prop value to undefined", async () => {
    render(
      <ActiveComponentPropEditors
        activeComponentState={state}
        propShape={propShape}
      />
    );
    expect(getComponentProps().bool).toEqual({
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: true,
    });
    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    await userEvent.click(screen.getByText("Set as Undefined"));
    expect(getComponentProps().bool).toBeUndefined();
  });

  it("resets color picker value to default", async () => {
    const propShape: PropShape = {
      bgColor: {
        type: PropValueType.HexColor,
        required: false,
      },
    };
    const state: StandardComponentState = {
      ...activeComponentState,
      props: {
        bgColor: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.HexColor,
          value: "#000000",
        },
      },
    };
    mockStoreActiveComponent({
      activeComponent: state,
      activeComponentMetadata: {
        ...activeComponentMetadata,
        propShape,
      },
    });
    render(<ActiveComponentPropEditorsWrapper propShape={propShape} />);
    expect(screen.getByLabelText("bgColor")).toHaveValue("#000000");

    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    await userEvent.click(screen.getByText("Set as Undefined"));
    expect(screen.queryByLabelText("bgColor")).toBeFalsy();
    expect(getComponentProps().bgColor).toBeUndefined();

    await userEvent.click(screen.getByLabelText("Toggle undefined value menu"));
    await userEvent.click(screen.getByText("Reset to Default"));
    expect(screen.getByLabelText("bgColor")).toHaveValue("#ffffff");
    expect(getComponentProps().bgColor).toEqual({
      kind: PropValueKind.Literal,
      valueType: PropValueType.HexColor,
      value: "#FFFFFF",
    });
  });
});

function ActiveComponentPropEditorsWrapper(props: { propShape: PropShape }) {
  const state = useStudioStore().pages.pages["index"].componentTree[0];
  return (
    <ActiveComponentPropEditors
      activeComponentState={state as StandardComponentState}
      propShape={props.propShape}
    />
  );
}

function createObjPropShape(objName: string, tooltip: string): PropShape {
  return {
    [objName]: {
      type: PropValueType.Object,
      required: false,
      shape: {
        title: {
          type: PropValueType.string,
          required: false,
          tooltip,
        },
      },
    },
  };
}
