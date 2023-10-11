import {
  ComponentStateKind,
  PropValueKind,
  PropValueType,
  FileMetadataKind,
  FileMetadata,
  ComponentMetadata,
  ComponentState,
  StandardComponentState,
} from "@yext/studio-plugin";
import path from "path-browserify";

export const componentState: StandardComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {
    title: {
      kind: PropValueKind.Expression,
      valueType: PropValueType.string,
      value: "This is Banner",
    },
  },
  uuid: "banner-uuid",
  metadataUUID: "banner-metadata-uuid",
};

const componentMetadata: ComponentMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "banner-metadata-uuid",
  propShape: {
    title: { type: PropValueType.string, required: false },
    num: { type: PropValueType.number, required: false },
    bool: { type: PropValueType.boolean, required: false },
    bgColor: { type: PropValueType.HexColor, required: false },
    nestedProp: {
      type: PropValueType.Object,
      shape: {
        egg: {
          type: PropValueType.string,
          required: false,
        },
      },
      required: false,
    },
  },
  filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
  cssImports: [],
};

const containerMetadata: ComponentMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "container-metadata-uuid",
  propShape: {
    text: { type: PropValueType.string, required: false },
  },
  filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
  cssImports: [],
};

export const mockUUIDToFileMetadata: Record<string, FileMetadata> = {
  "banner-metadata-uuid": componentMetadata,
  "container-metadata-uuid": containerMetadata,
};

export const nestedComponentTree: ComponentState[] = [
  {
    kind: ComponentStateKind.Standard,
    componentName: "Container",
    props: {
      text: {
        kind: PropValueKind.Literal,
        value: "Container 1",
        valueType: PropValueType.string,
      },
    },
    uuid: "container-uuid",
    metadataUUID: "container-metadata-uuid",
  },
  {
    ...componentState,
    props: {
      title: {
        kind: PropValueKind.Literal,
        value: "Banner 1",
        valueType: PropValueType.string,
      },
    },
    parentUUID: "container-uuid",
  },
  {
    kind: ComponentStateKind.Standard,
    componentName: "Container",
    props: {
      text: {
        kind: PropValueKind.Literal,
        value: "Container 2",
        valueType: PropValueType.string,
      },
    },
    uuid: "container-uuid-2",
    metadataUUID: "container-metadata-uuid",
    parentUUID: "container-uuid",
  },
  {
    ...componentState,
    props: {
      title: {
        kind: PropValueKind.Literal,
        value: "Banner 2",
        valueType: PropValueType.string,
      },
    },
    uuid: "banner-uuid-2",
    parentUUID: "container-uuid-2",
  },
];
