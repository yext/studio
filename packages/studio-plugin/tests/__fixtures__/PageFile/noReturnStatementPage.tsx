import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function IndexPage() {
  <>
    <ComplexBanner title="first!" num={1} />
    <ComplexBanner />
    <ComplexBanner title="three" num={3} bool={false} />
  </>;
}
