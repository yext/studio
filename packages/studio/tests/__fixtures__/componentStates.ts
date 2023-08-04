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

export const containerComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Container",
  props: {},
  uuid: "container-uuid",
  metadataUUID: "container-metadata-uuid",
};

export const child1Component: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Child1",
  props: {
    toy: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "balloon1",
    },
  },
  uuid: "child1-uuid",
  metadataUUID: "child1-metadata-uuid",
  parentUUID: "container-uuid",
};

export const child2Component: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Child2",
  props: {
    toy: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "balloon2",
    },
  },
  uuid: "child2-uuid",
  metadataUUID: "child2-metadata-uuid",
  parentUUID: "container-uuid",
};

export const resultsChildComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Results Child",
  props: {
    toy: {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "results balloon",
    },
  },
  uuid: "resultschild-uuid",
  metadataUUID: "resultschild-metadata-uuid",
  parentUUID: "results-uuid",
};
