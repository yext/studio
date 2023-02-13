import {
  Fragment,
  createElement,
  useMemo,
  useState,
  PropsWithChildren,
  useCallback,
  MouseEvent,
} from "react";
import useStudioStore from "../store/useStudioStore";
import {
  ComponentTreeHelpers,
  ComponentStateKind,
  TypeGuards,
  FileMetadataKind,
  PropValues,
  ComponentState,
  transformPropValuesToRaw,
  PropShape,
} from "@yext/studio-plugin";
import { ImportType } from "../store/models/ImportType";
import { useLayoutEffect } from "react";
import { getPreviewProps } from "../utils/getPreviewProps";
import ErrorBoundary from "./common/ErrorBoundary";
import useImportedComponents from "../hooks/useImportedComponents";
import classNames from "classnames";

interface ComponentTreePreviewProps {
  componentTree: ComponentState[];
  props?: PropValues;
  propShape?: PropShape;
  isWithinModule?: boolean;
}

/**
 * Renders the provided component tree.
 */
export default function ComponentTreePreview({
  componentTree,
  props,
  propShape,
  isWithinModule,
}: ComponentTreePreviewProps): JSX.Element {
  useImportedComponents(componentTree);
  const elements = useComponentTreeElements(
    componentTree,
    props,
    propShape,
    isWithinModule
  );
  return <>{elements}</>;
}

/**
 * Renders the component tree with props, where expressions
 * in prop values are replace with actual values.
 */
function useComponentTreeElements(
  componentTree: ComponentState[],
  props?: PropValues,
  propShape?: PropShape,
  isWithinModule?: boolean
): (JSX.Element | null)[] | null {
  const [UUIDToImportedComponent, UUIDToFileMetadata] = useStudioStore(
    (store) => [
      store.fileMetadatas.UUIDToImportedComponent,
      store.fileMetadatas.UUIDToFileMetadata,
    ]
  );
  const expressionSources = useExpressionSources(props, propShape);
  return useMemo(() => {
    // prevent logging errors on initial render before components are imported
    if (Object.keys(UUIDToImportedComponent).length === 0) {
      return null;
    }

    function renderComponent(
      c: ComponentState,
      children: (JSX.Element | null)[]
    ) {
      let element: ImportType | string;
      if (c.kind === ComponentStateKind.Fragment) {
        element = Fragment;
      } else if (c.kind === ComponentStateKind.BuiltIn) {
        element = c.componentName;
      } else {
        const metadata = UUIDToFileMetadata[c.metadataUUID];
        if (metadata && metadata.kind === FileMetadataKind.Module) {
          return (
            <ComponentTreePreview
              componentTree={metadata.componentTree}
              props={c.props}
              propShape={metadata.propShape}
              isWithinModule={true}
              key={c.uuid}
            />
          );
        } else if (!UUIDToImportedComponent[c.metadataUUID]) {
          // console.warn(
          //   `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
          // );
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
      return createElement(
        element,
        {
          ...previewProps,
          key: c.uuid,
        },
        ...children
      );
    }
    return ComponentTreeHelpers.mapComponentTree(
      componentTree,
      (c, children) => {
        if (isWithinModule) {
          return (
            <ErrorBoundary key={c.uuid}>
              {renderComponent(c, children)}
            </ErrorBoundary>
          );
        }
        return (
          <HighlightingContainer key={c.uuid} uuid={c.uuid}>
            <ErrorBoundary>{renderComponent(c, children)}</ErrorBoundary>
          </HighlightingContainer>
        );
      }
    );
  }, [
    UUIDToFileMetadata,
    UUIDToImportedComponent,
    expressionSources,
    componentTree,
    isWithinModule,
  ]);
}

/**
 * Responsible for highlighting the active component,
 * and updating the active component when clicked on.
 */
function HighlightingContainer(props: PropsWithChildren<{ uuid: string }>) {
  const setActiveComponentUUID = useStudioStore(
    (store) => store.pages.setActiveComponentUUID
  );
  const activeComponentUUID = useStudioStore(
    (store) => store.pages.activeComponentUUID
  );
  const ringClass =
    "relative before:ring before:absolute before:w-full before:h-full before:z-10";
  const className = classNames(ringClass, {
    "before:ring-blue-400": activeComponentUUID === props.uuid,
    "before:ring-transparent": activeComponentUUID !== props.uuid,
  });
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      setActiveComponentUUID(props.uuid);
    },
    [props.uuid, setActiveComponentUUID]
  );
  return (
    <div className={className} onClick={handleClick}>
      {props.children}
    </div>
  );
}

/**
 * Dynamically load files that serve as expression sources for the
 * expressions in prop's value. Currently, Studio only support expression
 * value sourced from props, site settings file, or a Stream document.
 */
function useExpressionSources(
  props?: PropValues,
  propShape?: PropShape
): Record<string, Record<string, unknown>> {
  const [expressionSources, setExpressionSources] = useState<
    Record<string, Record<string, unknown>>
  >({});
  const [siteSettingValues, activeEntityFile, isModuleBeingEdited] =
    useStudioStore((store) => [
      store.siteSettings.values,
      store.pages.activeEntityFile,
      !!store.pages.moduleUUIDBeingEdited,
    ]);

  useLayoutEffect(() => {
    const siteSettingsSource = siteSettingValues
      ? transformPropValuesToRaw(siteSettingValues)
      : {};
    setExpressionSources((prev) => ({
      ...prev,
      siteSettings: siteSettingsSource,
    }));
  }, [siteSettingValues]);

  const localDataPath = useStudioStore(
    (store) => store.studioConfig.paths.localData
  );

  useLayoutEffect(() => {
    if (!activeEntityFile || isModuleBeingEdited) {
      return setExpressionSources((prev) => {
        const { document: _, ...otherSources } = prev;
        return otherSources;
      });
    }
    const entityFilepath = `${localDataPath}/${activeEntityFile}`;
    import(/* @vite-ignore */ entityFilepath).then((importedModule) => {
      setExpressionSources((prev) => ({
        ...prev,
        document: importedModule["default"] as Record<string, unknown>,
      }));
    });
  }, [activeEntityFile, localDataPath, isModuleBeingEdited]);

  useLayoutEffect(() => {
    setExpressionSources((prev) => {
      const { props: _, ...otherSources } = prev;
      if (!props || !propShape) {
        return otherSources;
      }
      const propsSource = getPreviewProps(props, propShape, otherSources);
      return {
        ...otherSources,
        props: propsSource,
      };
    });
  }, [props, propShape]);

  return expressionSources;
}
