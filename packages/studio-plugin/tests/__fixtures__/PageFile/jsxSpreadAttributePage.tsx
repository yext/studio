import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function IndexPage() {
  const props = { title: "first" };
  return (
    <>
      <ComplexBanner {...props} />
    </>
  );
}
