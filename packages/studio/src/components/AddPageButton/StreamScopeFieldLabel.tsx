import { StreamScope } from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";

interface Props {
  streamScopeField: keyof StreamScope;
}

export default function StreamScopeFieldLabel({ streamScopeField }: Props) {
  const { tooltip, description } = streamScopeFieldData[streamScopeField];
  return (
    <label id={streamScopeField}>
      {description}
      <Tooltip
        anchorSelect={`#${streamScopeField}`}
        content={tooltip}
        place="top-start"
      />
    </label>
  );
}

const streamScopeFieldData = {
  entityIds: {
    description: "Entity IDs",
    tooltip: "In the Yext platform, navigate to Content > Entities",
  },
  entityTypes: {
    description: "Entity Type IDs",
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Entity Types",
  },
  savedFilterIds: {
    description: "Saved Filter IDs",
    tooltip:
      "In the Yext platform, navigate to Content > Configuration > Saved Filters",
  },
};
