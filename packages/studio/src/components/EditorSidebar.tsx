import { useState } from "react";
import { BsSliders } from "react-icons/bs";
import { FiType } from "react-icons/fi";
import { VscGlobe } from "react-icons/vsc";
import OptionPicker from "./common/OptionPicker";
import ContentPanel from "./ContentPanel";
import PropertiesPanel from "./PropertiesPanel";
import SiteSettingsPanel from "./SiteSettingsPanel";

enum Tab {
  Content = "Content",
  Properties = "Properties",
  SiteSettings = "SiteSettings",
}

const tabIcons = {
  [Tab.Content]: <FiType />,
  [Tab.Properties]: <BsSliders />,
  [Tab.SiteSettings]: <VscGlobe />,
};

/**
 * Renders the right panel of Studio.
 * Used for editing the active component's props or site settings.
 */
export default function EditorSidebar(): JSX.Element {
  const [selectedTab, setTab] = useState<Tab>(Tab.Content);

  return (
    <div className="p-4 ">
      <OptionPicker
        options={Tab}
        icons={tabIcons}
        defaultOption={Tab.Content}
        onSelect={setTab}
      />

      {renderTab(selectedTab)}
    </div>
  );
}

function renderTab(tab: Tab) {
  switch (tab) {
    case Tab.Content:
      return <ContentPanel />;
    case Tab.Properties:
      return <PropertiesPanel />;
    case Tab.SiteSettings:
      return <SiteSettingsPanel />;
  }
}
