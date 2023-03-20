import {
  ComponentState,
  ComponentStateKind,
  FileMetadataKind,
  PropValues,
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
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  const previewProps = usePreviewProps(
    componentState,
    expressionSources,
    parentProps
  );
  const element = useElement(componentState, (type) =>
    createElement(type, previewProps, ...childElements)
  );

  if (TypeGuards.isRepeaterState(componentState)) {
    return (
      <RepeaterPreview
        repeaterState={componentState}
        expressionSources={expressionSources}
        parentProps={parentProps}
      />
    );
  }
  if (TypeGuards.isModuleState(componentState)) {
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
  return element;
}

function useElement(
  c: ComponentState,
  createElement: (type: string | ImportType) => JSX.Element
): JSX.Element | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );

  const element: string | ImportType | undefined = useMemo(() => {
    if (TypeGuards.isRepeaterState(c) || TypeGuards.isModuleState(c)) {
      return undefined;
    } else if (c.kind === ComponentStateKind.Fragment) {
      return Fragment;
    } else if (c.kind === ComponentStateKind.BuiltIn) {
      return c.componentName;
    } else {
      const importedComponent = UUIDToImportedComponent[c.metadataUUID];
      if (!importedComponent) {
        console.warn(
          `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
        );
        return undefined;
      }
      return importedComponent;
    }
  }, [c, UUIDToImportedComponent]);

  return element ? createElement(element) : null;
}

function usePreviewProps(
  c: ComponentState,
  expressionSources: ExpressionSources,
  parentProps?: PropValues
) {
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  return TypeGuards.isStandardOrModuleComponentState(c)
    ? getPreviewProps(
        c.props,
        UUIDToFileMetadata[c.metadataUUID].propShape ?? {},
        expressionSources,
        parentProps ?? {}
      )
    : {};
}
