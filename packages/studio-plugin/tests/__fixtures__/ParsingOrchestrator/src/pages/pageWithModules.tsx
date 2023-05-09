import NestedBanner from "../components/NestedBanner";
import NestedModule from "../modules/a/b/NestedModule";

export const getPath = () => "modules.html";

export default function IndexPage() {
  return (
    <NestedBanner>
      <NestedModule />
    </NestedBanner>
  );
}
