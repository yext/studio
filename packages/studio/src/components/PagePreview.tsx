import { Fragment, createElement, useMemo, useState } from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentTreeHelpers,
  ComponentStateKind,
  PageState,
  TypeGuards,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";
import { getPreviewProps } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import initialStudioData from "virtual:yext-studio";

interface PagePreviewProps {
  pageState: PageState;
}

/**
 * Renders the provided page's component tree.
 */
export default function PagePreview({
  pageState,
}: PagePreviewProps): JSX.Element {
  useImportedComponents(pageState);
  const elements = usePageElements(pageState);
  return <>{elements}</>;
}

/**
 * Renders the page's component tree with props, where expressions
 * in prop values are replace with actual values.
 */
function usePageElements({
  componentTree,
}: PageState): (JSX.Element | null)[] | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );
  const UUIDToFileMetadata = useStudioStore(
    (store) => store.fileMetadatas.UUIDToFileMetadata
  );
  const expressionSources = useExpressionSources();
  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(UUIDToImportedComponent).length === 0) {
      return null;
    }
    return ComponentTreeHelpers.mapComponentTree(
      componentTree,
      (c, children) => {
        let element: ImportType | string;
        if (c.kind === ComponentStateKind.Fragment) {
          element = Fragment;
        } else if (c.kind === ComponentStateKind.BuiltIn) {
          element = c.componentName;
        } else {
          if (!UUIDToImportedComponent[c.metadataUUID]) {
            console.warn(
              `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
            );
            return null;
          }
          element = UUIDToImportedComponent[c.metadataUUID];
        }

        const previewProps = TypeGuards.isStandardOrModuleComponentState(c)
          ? getPreviewProps(
              c.props,
              UUIDToFileMetadata[c.metadataUUID].propShape ?? {},
              expressionSources
            )
          : {};
        const component = createElement(
          element,
          {
            ...previewProps,
            key: c.uuid,
          },
          ...children
        );

        return (
          <ErrorBoundary key={c.uuid}>
            <div>{component}</div>
          </ErrorBoundary>
        );
      }
    );
  }, [
    UUIDToFileMetadata,
    UUIDToImportedComponent,
    expressionSources,
    componentTree,
  ]);
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value. Currently, Studio only support expression
 * value sourced from site settings file or a Stream document.
 */
function useExpressionSources(): Record<string, Record<string, unknown>> {
  const [expressionSources, setExpressionSources] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const siteSettingValues = useStudioStore(
    (store) => store.siteSettings.values
  );
  const activeEntityFile = useStudioStore(
    (store) => store.pages.activeEntityFile
  );

  useLayoutEffect(() => {
    const siteSettingsSource = Object.entries(siteSettingValues ?? {}).reduce(
      (map, [propName, proVal]) => {
        map[propName] = proVal.value;
        return map;
      },
      {}
    );
    setExpressionSources((prev) => ({
      ...prev,
      siteSettings: siteSettingsSource,
    }));
  }, [siteSettingValues]);

  useLayoutEffect(() => {
    if (!activeEntityFile) {
      return;
    }
    const entityFilepath = `${initialStudioData.userPaths.localData}/${activeEntityFile}`;
    import(entityFilepath).then((importedModule) => {
      setExpressionSources((prev) => ({
        ...prev,
        document: importedModule["default"] as Record<string, unknown>,
      }));
    });
  }, [activeEntityFile]);

  return expressionSources;
}
