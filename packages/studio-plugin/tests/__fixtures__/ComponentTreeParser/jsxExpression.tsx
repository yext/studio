import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function Test() {
  return <>{true && <ComplexBanner title="first" />}</>;
}
