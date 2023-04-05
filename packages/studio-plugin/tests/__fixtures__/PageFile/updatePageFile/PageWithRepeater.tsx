import ComplexBanner from "../../ComponentFile/ComplexBanner";

export default function IndexPage() {
  return (
    <>
      {document.services.map((item, index) => (
        <ComplexBanner key={index} />
      ))}
    </>
  );
}
