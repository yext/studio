import ComplexBanner from "../../ComponentFile/ComplexBanner";
import NestedBanner from "../../ComponentFile/NestedBanner";

export default function IndexPage() {
  return (
    <NestedBanner>
      <ComplexBanner num={1} title="first!" />
      <ComplexBanner />
      <NestedBanner>
        <ComplexBanner num={3} title="three" bool={false} />
      </NestedBanner>
    </NestedBanner>
  );
}
