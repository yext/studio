import { useState } from "react";
import PropertiesPanel from "./PropertiesPanel";
import OptionPicker from "./common/OptionPicker";
import Divider from "./common/Divider";
import { ReactComponent as Sliders } from "../icons/sliders.svg";
import { ReactComponent as Globe } from "../icons/globe.svg";
import { ReactComponent as Content } from "../icons/content.svg";
import SiteSettingsPanel from "./SiteSettingsPanel";
import ContentPanel from "./ContentPanel";

enum Tab {
  Properties = "Properties",
  Content = "Content",
  SiteSettings = "SiteSettings",
}

const tabIcons = {
  [Tab.Properties]: <Sliders className="w-4" />,
  [Tab.Content]: <Content className="w-7" />,
  [Tab.SiteSettings]: <Globe className="w-4" />,
};

/**
 * Renders the right panel of Studio, for editing a module or component.
 */
export default function EditorSidebar(): JSX.Element {
  const [selectedTab, setTab] = useState<Tab>(Tab.Properties);

  return (
    <div className="w-1/4 px-4">
      <OptionPicker
        options={Tab}
        icons={tabIcons}
        defaultOption={Tab.Properties}
        onSelect={setTab}
      />
      <Divider />
      {renderTab(selectedTab)}
    </div>
  );
}

function renderTab(tab: Tab) {
  switch (tab) {
    case Tab.Properties:
      return <PropertiesPanel />;
    case Tab.Content:
      return <ContentPanel />;
    case Tab.SiteSettings:
      return <SiteSettingsPanel />;
  }
}
