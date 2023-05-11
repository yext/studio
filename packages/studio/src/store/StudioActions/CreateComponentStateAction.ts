import {
  ComponentStateKind,
  FileMetadataKind,
  PropValueKind,
  PropValueType,
  RecordProp,
  StandardOrModuleComponentState,
  ValidFileMetadata,
} from "@yext/studio-plugin";
import path from "path-browserify";
import { v4 } from "uuid";
import StudioConfigSlice from "../models/slices/StudioConfigSlice";

export default class CreateComponentStateAction {
  constructor(private getStudioConfig: () => StudioConfigSlice) {}

  createComponentState = (
    metadata: ValidFileMetadata
  ): StandardOrModuleComponentState => {
    const componentName = path.basename(metadata.filepath, ".tsx");
    const componentState: StandardOrModuleComponentState = {
      kind:
        metadata.kind === FileMetadataKind.Module
          ? ComponentStateKind.Module
          : ComponentStateKind.Standard,
      componentName,
      props: metadata.initialProps ?? {},
      uuid: v4(),
      metadataUUID: metadata.metadataUUID,
    };
    const transformedState = this.transformProps(componentState);
    return transformedState;
  };

  private transformProps(
    componentState: StandardOrModuleComponentState
  ): StandardOrModuleComponentState {
    if (
      componentState.kind === ComponentStateKind.Module &&
      this.getStudioConfig().isPagesJSRepo
    ) {
      const documentProp: RecordProp = {
        kind: PropValueKind.Expression,
        valueType: PropValueType.Record,
        value: "document",
      };
      return {
        ...componentState,
        props: {
          ...componentState.props,
          document: documentProp,
        },
      };
    }
    return componentState;
  }
}
