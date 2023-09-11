import {
  ComponentStateKind,
  StandardComponentState,
  ComponentMetadata,
} from "@yext/studio-plugin";
import path from "path-browserify";
import { v4 } from "uuid";
import PropValueHelpers from "../../utils/PropValueHelpers";

export default class CreateComponentStateAction {
  createComponentState = (
    metadata: ComponentMetadata
  ): StandardComponentState => {
    const componentName = path.basename(metadata.filepath, ".tsx");
    const componentState: StandardComponentState = {
      kind: ComponentStateKind.Standard,
      componentName,
      props: {
        ...PropValueHelpers.getDefaultPropValues(metadata.propShape ?? {}),
        ...metadata.initialProps,
      },
      uuid: v4(),
      metadataUUID: metadata.metadataUUID,
    };
    return componentState;
  };
}
