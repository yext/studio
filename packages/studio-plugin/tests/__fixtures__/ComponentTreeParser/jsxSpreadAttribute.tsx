import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function Test() {
  const props = { title: "first" };
  return (
    <>
      <ComplexBanner {...props} />
    </>
  );
}
