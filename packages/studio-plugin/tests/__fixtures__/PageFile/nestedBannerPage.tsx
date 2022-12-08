import ComplexBanner from "../ComponentFile/ComplexBanner";
import NestedBanner from "../ComponentFile/NestedBanner";

export default function IndexPage() {
  return (
    <NestedBanner>
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <NestedBanner>
        <ComplexBanner title="three" num={3} bool={false} />
      </NestedBanner>
    </NestedBanner>
  );
}
