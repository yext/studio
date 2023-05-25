import {
  ComponentStateKind,
  PropValueKind,
  PropValueType,
  FileMetadataKind,
  FileMetadata,
  ComponentMetadata,
  ModuleMetadata,
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
};

const containerMetadata: ComponentMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "container-metadata-uuid",
  propShape: {
    text: { type: PropValueType.string, required: false },
  },
  filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
};

const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  metadataUUID: "panel-metadata-uuid",
  propShape: {
    text: { type: PropValueType.string, required: false },
  },
  filepath: path.resolve(__dirname, "../__mocks__/Panel.tsx"),
  componentTree: [
    {
      kind: ComponentStateKind.Fragment,
      uuid: "fragment-uuid",
    },
    {
      ...componentState,
      uuid: "internal-banner-uuid-0",
      props: {
        title: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "props.text",
        },
      },
      parentUUID: "fragment-uuid",
    },
    {
      ...componentState,
      uuid: "internal-banner-uuid-1",
      parentUUID: "fragment-uuid",
    },
  ],
};

const moduleWithObjPropsMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  metadataUUID: "module-obj-props-metadata-uuid",
  propShape: {
    obj: {
      type: PropValueType.Object,
      required: false,
      shape: {
        text: { type: PropValueType.string, required: false },
      },
    },
  },
  filepath: "unused",
  componentTree: [
    {
      ...componentState,
      props: {
        title: {
          kind: PropValueKind.Expression,
          valueType: PropValueType.string,
          value: "`hello ${props.obj?.text}`",
        },
      },
    },
  ],
};

export const mockUUIDToFileMetadata: Record<string, FileMetadata> = {
  "banner-metadata-uuid": componentMetadata,
  "container-metadata-uuid": containerMetadata,
  "panel-metadata-uuid": moduleMetadata,
  "module-obj-props-metadata-uuid": moduleWithObjPropsMetadata,
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
