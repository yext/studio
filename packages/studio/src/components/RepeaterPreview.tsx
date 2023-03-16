import { RepeaterState } from "@yext/studio-plugin";
import { get } from "lodash";
import { useCallback, useMemo } from "react";
import { ExpressionSources } from "../utils/getPreviewProps";
import ComponentPreview from "./ComponentPreview";

interface RepeaterPreviewProps {
  repeaterState: RepeaterState;
  expressionSources: ExpressionSources;
}

/**
 * Renders the preview for a Repeater component.
 */
export default function RepeaterPreview({
  repeaterState,
  expressionSources,
}: RepeaterPreviewProps): JSX.Element | null {
  const { repeatedComponent, listExpression } = repeaterState;
  const repeatedElementState = useMemo(
    () => ({
      ...repeatedComponent,
      uuid: repeaterState.uuid,
      parentUUID: repeaterState.parentUUID,
    }),
    [repeatedComponent, repeaterState]
  );

  const getExpressionSources = useCallback(
    (item: unknown) => ({
      ...expressionSources,
      item,
    }),
    [expressionSources]
  );

  const renderRepeatedElement = useCallback(
    (item: unknown, key: number | string) => (
      <ComponentPreview
        componentState={repeatedElementState}
        expressionSources={getExpressionSources(item)}
        key={key}
      />
    ),
    [repeatedElementState, getExpressionSources]
  );

  const list = get(expressionSources, listExpression) as unknown;
  if (!Array.isArray(list)) {
    console.warn(
      `Unable to render list repeater. Expected ${listExpression} to be an array.`
    );
    return null;
  }
  return <>{list.map(renderRepeatedElement)}</>;
}
