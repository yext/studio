import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  PropValues,
  RepeaterState,
  TypeGuards,
} from "@yext/studio-plugin";
import { createElement, Fragment, useMemo } from "react";
import { ImportType } from "../store/models/ImportType";
import useStudioStore from "../store/useStudioStore";
import { ExpressionSources, getPreviewProps } from "../utils/getPreviewProps";
import ComponentTreePreview from "./ComponentTreePreview";
import RepeaterPreview from "./RepeaterPreview";

interface ComponentPreviewProps {
  componentState: ComponentState;
  expressionSources: ExpressionSources;
  parentProps?: PropValues;
  childElements?: (JSX.Element | null)[];
}

/**
 * Renders the preview for a component.
 */
export default function ComponentPreview({
  componentState,
  expressionSources,
  parentProps,
  childElements = [],
}: ComponentPreviewProps): JSX.Element | null {
  const [UUIDToImportedComponent, UUIDToFileMetadata] = useStudioStore(
    (store) => [
      store.fileMetadatas.UUIDToImportedComponent,
      store.fileMetadatas.UUIDToFileMetadata,
    ]
  );
  const previewProps = useMemo(() => {
    return TypeGuards.isStandardOrModuleComponentState(componentState)
      ? getPreviewProps(
          componentState.props,
          UUIDToFileMetadata[componentState.metadataUUID].propShape ?? {},
          expressionSources,
          parentProps ?? {}
        )
      : {};
  }, [componentState, UUIDToFileMetadata, expressionSources, parentProps]);

  if (TypeGuards.isRepeaterState(componentState)) {
    return (
      <RepeaterPreview
        repeaterState={componentState}
        expressionSources={expressionSources}
      />
    );
  }
  if (componentState.kind === ComponentStateKind.Module) {
    const metadata = UUIDToFileMetadata[componentState.metadataUUID];
    if (metadata?.kind === FileMetadataKind.Module) {
      return (
        <ComponentTreePreview
          componentTree={metadata.componentTree}
          parentProps={componentState.props}
          renderHighlightingContainer={false}
        />
      );
    }
  }
  const element = getElement(componentState, UUIDToImportedComponent);
  if (!element) {
    return null;
  }
  return createElement(element, previewProps, ...childElements);
}

function getElement(
  c: Exclude<ComponentState, RepeaterState>,
  UUIDToImportedComponent: Record<string, ImportType>
): string | ImportType | undefined {
  if (c.kind === ComponentStateKind.Fragment) {
    return Fragment;
  } else if (c.kind === ComponentStateKind.BuiltIn) {
    return c.componentName;
  } else {
    const importedComponent = UUIDToImportedComponent[c.metadataUUID];
    if (!importedComponent) {
      console.warn(
        `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
      );
    }
    return importedComponent;
  }
}
