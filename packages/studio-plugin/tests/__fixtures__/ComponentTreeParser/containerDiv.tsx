import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function Test() {
  return (
    <div id="div-id">
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <ComplexBanner title="three" num={3} bool={false} />
    </div>
  );
}
