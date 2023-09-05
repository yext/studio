import { RepeaterState } from "@yext/studio-plugin";
import get from "lodash/get";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import { ExpressionSources } from "../utils/getPropsForPreview";
import ComponentPreview from "./ComponentPreview";
import { ITooltip } from "react-tooltip";

interface RepeaterPreviewProps {
  repeaterState: RepeaterState;
  expressionSources: ExpressionSources;
  setTooltipProps: Dispatch<SetStateAction<ITooltip>>;
}

/**
 * Renders the preview for a Repeater component.
 */
export default function RepeaterPreview({
  repeaterState,
  expressionSources,
  setTooltipProps,
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

  const renderRepeatedElement = useCallback(
    (item: unknown, key: number | string) => (
      <ComponentPreview
        componentState={repeatedElementState}
        expressionSources={expressionSources}
        parentItem={item}
        key={key}
        setTooltipProps={setTooltipProps}
      />
    ),
    [repeatedElementState, expressionSources, setTooltipProps]
  );

  const list = get(expressionSources, listExpression) as unknown;
  if (!Array.isArray(list)) {
    console.warn(
      `Unable to render list repeater. Expected "${listExpression}" to reference an array in `,
      expressionSources
    );
    return null;
  }
  return <>{list.map(renderRepeatedElement)}</>;
}
