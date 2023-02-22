import { useState } from "react";
import { ReactComponent as Content } from "../icons/content.svg";
import { ReactComponent as Globe } from "../icons/globe.svg";
import { ReactComponent as Sliders } from "../icons/sliders.svg";
import Divider from "./common/Divider";
import OptionPicker from "./common/OptionPicker";
import ContentPanel from "./ContentPanel";
import PropertiesPanel from "./PropertiesPanel";
import SiteSettingsPanel from "./SiteSettingsPanel";

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
 * Renders the right panel of Studio.
 * Used for editing the active component's props or site settings.
 */
export default function EditorSidebar(): JSX.Element {
  const [selectedTab, setTab] = useState<Tab>(Tab.Properties);

  return (
    <div className="w-[400px] p-4 border-l bg-white shadow">
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
