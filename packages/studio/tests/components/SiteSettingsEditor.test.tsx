import { render, screen, fireEvent } from "@testing-library/react";
import {
  PropValueKind,
  PropValueType,
  SiteSettingsShape,
  SiteSettingsValues,
} from "@yext/studio-plugin";
import SiteSettingsEditor from "../../src/components/SiteSettingsEditor";
import mockStore from "../__utils__/mockStore";

const shape: SiteSettingsShape = {
  "Global Colors": {
    type: PropValueType.Object,
    shape: {
      primary: {
        type: PropValueType.HexColor,
      },
      secondary: {
        type: PropValueType.HexColor,
      },
    },
  },
  experienceKey: {
    type: PropValueType.string,
  }
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
  render(<SiteSettingsEditor />);
  expect(screen.getByText("Global Colors")).toBeDefined();
  expect(screen.getByText("primary")).toBeDefined();
  expect(screen.getByText("secondary")).toBeDefined();
  expect(screen.getByText("experienceKey")).toBeDefined();
});

it('can render even when optional settings are not specified', () => {
  mockStore({
    siteSettings: {
      shape: {
        ...shape,
        optionalString: {
          type: PropValueType.string
        }
      },
      values,
    },
  });
  render(<SiteSettingsEditor />);
  expect(screen.getByText("Global Colors")).toBeDefined();
})

it("can edit site settings", () => {
  const setValues = jest.fn();
  mockStore({
    siteSettings: {
      shape,
      values,
      setValues,
    },
  });
  render(<SiteSettingsEditor />);
  expect(setValues).toHaveBeenCalledTimes(0);
  const colorInput = screen.getByLabelText("primary");
  fireEvent.input(colorInput, {
    target: { value: "#abcdef" },
  });
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
});
