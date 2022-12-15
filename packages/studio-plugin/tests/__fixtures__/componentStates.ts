import {
  ComponentState,
  ComponentStateKind,
  PropValueKind,
  PropValueType,
} from "../../src";
import { getComponentPath } from "../__utils__/getFixturePath";

export const fragmentComponent: ComponentState = {
  kind: ComponentStateKind.Fragment,
  uuid: "mock-uuid-0",
};

export const complexBannerComponent: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "ComplexBanner",
  props: {},
  uuid: "mock-uuid-0",
}

export const componentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 1,
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "first!",
      },
    },
    uuid: "mock-uuid-1",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {},
    uuid: "mock-uuid-2",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    props: {
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 3,
      },
      title: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "three",
      },
      bool: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.boolean,
        value: false,
      },
    },
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("ComplexBanner"),
  },
];

export const nestedBannerComponentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "NestedBanner",
    props: {},
    uuid: "mock-uuid-0",
    metadataUUID: getComponentPath("NestedBanner"),
  },
  componentTree[0],
  componentTree[1],
  {
    kind: ComponentStateKind.Standard,
    componentName: "NestedBanner",
    props: {},
    uuid: "mock-uuid-3",
    parentUUID: "mock-uuid-0",
    metadataUUID: getComponentPath("NestedBanner"),
  },
  {
    ...componentTree[2],
    parentUUID: "mock-uuid-3",
    uuid: "mock-uuid-4",
  },
];

export const streamConfigMultipleFieldsComponentTree: ComponentState[] = [
  fragmentComponent,
  {
    kind: ComponentStateKind.Standard,
    componentName: "SimpleBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-1",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "document.title",
        valueType: PropValueType.string,
      },
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "SimpleBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-2",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "`this is ${document.stringLiteral}`",
        valueType: PropValueType.string,
      },
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "SimpleBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-3",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "document.arrayIndex[0]",
        valueType: PropValueType.string,
      },
    },
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "SimpleBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-4",
    props: {
      title: {
        kind: PropValueKind.Literal,
        value: "document.notAStreamField",
        valueType: PropValueType.string,
      },
    },
  },
];
