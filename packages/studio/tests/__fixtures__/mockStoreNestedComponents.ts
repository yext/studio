import {
  ComponentStateKind,
  PropValueKind,
  PropValueType,
  FileMetadataKind,
  FileMetadata,
} from "@yext/studio-plugin";
import path from "path-browserify";
import { MockStudioStore } from "../__utils__/mockStore";

const UUIDToFileMetadata: Record<string, FileMetadata> = {
  "banner-metadata-uuid": {
    kind: FileMetadataKind.Component,
    metadataUUID: "banner-metadata-uuid",
    propShape: {
      title: { type: PropValueType.string },
      num: { type: PropValueType.number },
      bool: { type: PropValueType.boolean },
      bgColor: { type: PropValueType.HexColor },
      nestedProp: {
        type: PropValueType.Object,
        shape: {
          egg: {
            type: PropValueType.string,
          },
        },
      },
    },
    filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
  },
};

export const mockStoreNestedComponentState: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
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
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 1",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid",
            metadataUUID: "banner-metadata-uuid",
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
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 2",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid-2",
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "container-uuid-2",
          },
        ],
        filepath: "mock/file/path",
        entityFiles: ["entityFile.json"],
        cssImports: [],
      },
    },
    activePageName: "universalPage",
    activeEntityFile: "entityFile.json",
  },
  fileMetadatas: {
    UUIDToFileMetadata: {
      ...UUIDToFileMetadata,
      "container-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "container-metadata-uuid",
        propShape: {
          text: { type: PropValueType.string },
        },
        filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
      },
    },
  },
};
