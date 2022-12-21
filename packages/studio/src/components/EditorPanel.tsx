import { useState } from "react";
import ComponentEditor from "./ComponentEditor";
import OptionPicker from "./common/OptionPicker";
import Divider from "./common/Divider";
import { ReactComponent as Sliders } from "../icons/sliders.svg";
import { ReactComponent as Content } from "../icons/content.svg";

enum PanelTab {
  Properties = "Properties",
  Content = "Content",
}

const tabsWithIcon = [
  {
    option: PanelTab.Properties,
    icon: <Sliders className="w-4" />,
  },
  {
    option: PanelTab.Content,
    icon: <Content className="w-7" />,
  },
];

/**
 * Renders the right panel of Studio, for editing a module or component.
 */
export default function EditorPanel(): JSX.Element {
  const [selectedTab, setTab] = useState<PanelTab>(PanelTab.Properties);

  return (
    <div className="w-1/4 px-4">
      <OptionPicker
        options={tabsWithIcon}
        defaultOption={PanelTab.Properties}
        onSelect={setTab}
      />
      <Divider />
      {renderTab(selectedTab)}
    </div>
  );
}

function renderTab(tab: PanelTab) {
  switch (tab) {
    case PanelTab.Properties:
      return <ComponentEditor />;
    case PanelTab.Content:
      return <div>TODO: Implement me!</div>;
  }
}
