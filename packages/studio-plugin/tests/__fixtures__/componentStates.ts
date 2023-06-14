import {
  ComponentState,
  ComponentStateKind,
  PropValueKind,
  PropValueType,
} from "../../src/types";
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
  metadataUUID: "complexbanner-metadata",
};

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
    componentName: "ComplexBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-1",
    metadataUUID: "banner-metadata",
    props: {
      title: {
        kind: PropValueKind.Expression,
        value: "document.title",
        valueType: PropValueType.string,
      },
      cta: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Object,
        value: {
          link: {
            kind: PropValueKind.Expression,
            value: "document.exp",
            valueType: PropValueType.string,
          },
          linkType: {
            kind: PropValueKind.Literal,
            value: "linktype",
            valueType: PropValueType.string,
          },
          label: {
            kind: PropValueKind.Literal,
            value: "label",
            valueType: PropValueType.string,
          },
        },
      },
      colorArr: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.Array,
        value: [
          {
            kind: PropValueKind.Expression,
            value: "document.color",
            valueType: PropValueType.HexColor,
          },
        ],
      },
    },
  },
  {
    kind: ComponentStateKind.Repeater,
    repeatedComponent: {
      kind: ComponentStateKind.Standard,
      componentName: "ComplexBanner",
      metadataUUID: "banner-metadata",
      props: {
        title: {
          kind: PropValueKind.Expression,
          value: "`this is ${document.stringLiteral}`",
          valueType: PropValueType.string,
        },
      },
    },
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-2",
    listExpression: "document.services",
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "ComplexBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-3",
    metadataUUID: "banner-metadata",
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
    componentName: "ComplexBanner",
    parentUUID: "mock-uuid-0",
    uuid: "mock-uuid-4",
    metadataUUID: "banner-metadata",
    props: {
      title: {
        kind: PropValueKind.Literal,
        value: "document.notAStreamField",
        valueType: PropValueType.string,
      },
    },
  },
];
