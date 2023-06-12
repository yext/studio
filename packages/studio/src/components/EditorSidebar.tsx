import { useState } from "react";
import PropsPanel from "./PropsPanel";
import OptionPicker from "./common/OptionPicker";
import Divider from "./common/Divider";
import { ReactComponent as Globe } from "../icons/globe.svg";
import { ReactComponent as Content } from "../icons/content.svg";
import SiteSettingsPanel from "./SiteSettingsPanel";

enum Tab {
  Props = "Props",
  SiteSettings = "SiteSettings",
}

const tabIcons = {
  [Tab.Props]: <Content className="w-7" />,
  [Tab.SiteSettings]: <Globe className="w-4" />,
};

/**
 * Renders the right panel of Studio.
 * Used for editing the active component's props or site settings.
 */
export default function EditorSidebar(): JSX.Element {
  const [selectedTab, setTab] = useState<Tab>(Tab.Props);

  return (
    <div className="w-1/4 px-4" data-testid="EditorSidebar">
      <OptionPicker
        options={Tab}
        icons={tabIcons}
        defaultOption={Tab.Props}
        onSelect={setTab}
      />
      <Divider />
      {renderTab(selectedTab)}
    </div>
  );
}

function renderTab(tab: Tab) {
  switch (tab) {
    case Tab.Props:
      return <PropsPanel />;
    case Tab.SiteSettings:
      return <SiteSettingsPanel />;
  }
}
