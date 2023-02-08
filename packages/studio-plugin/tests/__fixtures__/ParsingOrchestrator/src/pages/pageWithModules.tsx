import NestedBanner from "../components/NestedBanner";
import NestedModule from "../modules/a/b/NestedModule";

export default function IndexPage() {
  return (
    <NestedBanner>
      <NestedModule />
    </NestedBanner>
  );
}
