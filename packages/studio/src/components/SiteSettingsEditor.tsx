import useStudioStore from "../store/useStudioStore";

export default function SiteSettingsEditor() {
  const siteSettings = useStudioStore((store) => store.siteSettings.values);
  return <div>{JSON.stringify(siteSettings, null, 2)}</div>;
}
