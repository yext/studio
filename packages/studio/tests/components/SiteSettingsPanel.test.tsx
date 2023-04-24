import { render, screen, fireEvent } from "@testing-library/react";
import {
  PropValueKind,
  PropValueType,
  SiteSettingsShape,
  SiteSettingsValues,
} from "@yext/studio-plugin";
import SiteSettingsPanel from "../../src/components/SiteSettingsPanel";
import mockStore from "../__utils__/mockStore";

const shape: SiteSettingsShape = {
  "Global Colors": {
    type: PropValueType.Object,
    required: false,
    shape: {
      primary: {
        type: PropValueType.HexColor,
        required: false,
      },
      secondary: {
        type: PropValueType.HexColor,
        required: false,
      },
    },
  },
  experienceKey: {
    type: PropValueType.string,
    required: false,
  },
} as const;
const values: SiteSettingsValues = {
  "Global Colors": {
    kind: PropValueKind.Literal,
    valueType: PropValueType.Object,
    value: {
      primary: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.HexColor,
        value: "#AABBCC",
      },
      secondary: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.HexColor,
        value: "#FFEEFF",
      },
    },
  },
  experienceKey: {
    kind: PropValueKind.Literal,
    value: "slanswers",
    valueType: PropValueType.string,
  },
} as const;

it("can render nested site settings", () => {
  mockStore({
    siteSettings: {
      shape,
      values,
    },
  });
  render(<SiteSettingsPanel />);
  expect(screen.getByText("Global Colors")).toBeDefined();
  expect(screen.getByText("Primary")).toBeDefined();
  expect(screen.getByText("Secondary")).toBeDefined();
  expect(screen.getByText("Experience Key")).toBeDefined();
});

it("can render even when optional settings are not specified", () => {
  mockStore({
    siteSettings: {
      shape: {
        ...shape,
        optionalString: {
          type: PropValueType.string,
          required: false,
        },
      },
      values,
    },
  });
  render(<SiteSettingsPanel />);
  expect(screen.getByText("Global Colors")).toBeDefined();
});

it("can edit site settings", async () => {
  jest.useFakeTimers();
  const setValues = jest.fn();
  mockStore({
    siteSettings: {
      shape,
      values,
      setValues,
    },
  });
  render(<SiteSettingsPanel />);
  expect(setValues).toHaveBeenCalledTimes(0);
  const colorInput = screen.getByLabelText("Primary");
  fireEvent.input(colorInput, {
    target: { value: "#abcdef" },
  });
  await screen.findByDisplayValue("#abcdef");
  jest.advanceTimersByTime(100); //debounce time
  expect(setValues).toHaveBeenCalledTimes(1);
  expect(setValues).toHaveBeenCalledWith({
    ...values,
    "Global Colors": {
      ...values["Global Colors"],
      value: {
        primary: {
          kind: PropValueKind.Literal,
          value: "#abcdef",
          valueType: PropValueType.HexColor,
        },
        secondary: {
          kind: PropValueKind.Literal,
          value: "#FFEEFF",
          valueType: PropValueType.HexColor,
        },
      },
    },
  });
  jest.useRealTimers();
});
