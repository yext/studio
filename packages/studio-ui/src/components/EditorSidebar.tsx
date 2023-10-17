import { useState } from "react";
import PropsPanel from "./PropsPanel";
import OptionPicker from "./common/OptionPicker";
import Divider from "./common/Divider";
import { ReactComponent as Globe } from "../icons/globe.svg";
import { ReactComponent as Content } from "../icons/content.svg";
import SiteSettingsPanel from "./SiteSettingsPanel";
import EntityPicker from "./EntityPicker";
import CollapsibleContainer from "./CollapsibleContainer";

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
    <CollapsibleContainer collapseDirection="right">
      <div className="flex flex-col grow px-4" data-testid="EditorSidebar">
        <OptionPicker
          options={Tab}
          icons={tabIcons}
          defaultOption={Tab.Props}
          onSelect={setTab}
        />
        <Divider />
        {renderTab(selectedTab)}
      </div>
    </CollapsibleContainer>
  );
}

function renderTab(tab: Tab) {
  switch (tab) {
    case Tab.Props:
      return (
        <>
          <EntityPicker />
          <PropsPanel />
        </>
      );
    case Tab.SiteSettings:
      return <SiteSettingsPanel />;
  }
}
