import {
  RepeaterState,
  ComponentStateKind,
  PropValueKind,
  PropValueType,
  ComponentMetadata,
  FileMetadataKind,
  ModuleMetadata,
} from "@yext/studio-plugin";
import mockStoreActiveComponent from "./mockActiveComponentState";

const repeaterComponentState: RepeaterState = {
  kind: ComponentStateKind.Repeater,
  uuid: "1234",
  listExpression: "someList",
  repeatedComponent: {
    kind: ComponentStateKind.Standard,
    componentName: "Standard",
    props: {
      text: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.string,
        value: "test",
      },
      num: {
        kind: PropValueKind.Literal,
        valueType: PropValueType.number,
        value: 5,
      },
    },
    metadataUUID: "5678",
  },
};
const componentMetadata: ComponentMetadata = {
  kind: FileMetadataKind.Component,
  filepath: "/some/file",
  metadataUUID: "5678",
  propShape: {
    text: {
      type: PropValueType.string,
      required: false,
    },
    num: {
      type: PropValueType.number,
      required: false,
    },
  },
};

const repeaterModuleState: RepeaterState = {
  kind: ComponentStateKind.Repeater,
  uuid: "1234",
  listExpression: "someList",
  repeatedComponent: {
    kind: ComponentStateKind.Module,
    componentName: "Mod",
    props: {},
    metadataUUID: "5678",
  },
};
const moduleMetadata: ModuleMetadata = {
  kind: FileMetadataKind.Module,
  filepath: "/some/file",
  metadataUUID: "5678",
  propShape: {},
  componentTree: [],
};

export function mockRepeaterActiveComponent(isRepeatedModule = false) {
  if (isRepeatedModule) {
    return mockStoreActiveComponent({
      activeComponent: repeaterModuleState,
      activeComponentMetadata: moduleMetadata,
    });
  }
  return mockStoreActiveComponent({
    activeComponent: repeaterComponentState,
    activeComponentMetadata: componentMetadata,
  });
}
