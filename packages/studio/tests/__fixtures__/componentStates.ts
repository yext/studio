import {
  ComponentState,
  ComponentStateKind,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";

export const fragmentComponent: ComponentState = {
  kind: ComponentStateKind.Fragment,
  uuid: "fragment-uuid",
};

export const searchBarComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "SearchBar",
  props: {
    query: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "what is Yext?",
    },
  },
  uuid: "searchbar-uuid",
  metadataUUID: "searchbar-metadata-uuid",
};

export const resultsComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "results",
  props: {
    limit: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.number,
      value: 10,
    },
  },
  uuid: "results-uuid",
  metadataUUID: "results-metadata-uuid",
};

export const buttonComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Button",
  props: {
    clicked: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: false,
    },
  },
  uuid: "button-uuid",
  metadataUUID: "button-metadata-uuid",
};
