import { useState } from "react";
import ComponentEditor from "./ComponentEditor";
import OptionPicker from "./common/OptionPicker";
import Divider from "./common/Divider";
import { ReactComponent as Sliders } from "../icons/sliders.svg";
import { ReactComponent as Content } from "../icons/content.svg";
import { ReactComponent as Globe } from "../icons/globe.svg";
import SiteSettingsEditor from "./SiteSettingsEditor";
import useActiveComponent from "../hooks/useActiveComponent";
import { FileMetadataKind } from "@yext/studio-plugin";
import ModuleActions from "./ModuleActions";

enum PanelTab {
  Properties = "Properties",
  Content = "Content",
  SiteSettings = "SiteSettings",
}

const tabIcons = {
  [PanelTab.Properties]: <Sliders className="w-4" />,
  [PanelTab.Content]: <Content className="w-7" />,
  [PanelTab.SiteSettings]: <Globe className="w-4" />,
};

/**
 * Renders the right panel of Studio, for editing a module or component.
 */
export default function EditorPanel(): JSX.Element {
  const [selectedTab, setTab] = useState<PanelTab>(PanelTab.Properties);

  return (
    <div className="w-1/4 px-4">
      <OptionPicker
        options={PanelTab}
        icons={tabIcons}
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
    case PanelTab.SiteSettings:
      return <SiteSettingsEditor />;
  }
}
