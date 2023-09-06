import { StreamScope } from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import { streamScopeFormData } from "../PageSettingsButton/EntityPageModal";

interface Props {
  streamScopeField: keyof StreamScope;
}

export default function StreamScopeFieldLabel({ streamScopeField }: Props) {
  const { tooltip, description } = streamScopeFormData[streamScopeField];
  return (
    <label id={streamScopeField}>
      {description}
      <Tooltip anchorSelect={`#${streamScopeField}`} content={tooltip} />
    </label>
  );
}
