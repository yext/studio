import Card from "../components/Card";

export const getPath = () => "index.html";

export default function IndexPage() {
  return (
    <div>
      <Card text="first!" />
      <Card text="second!" />
    </div>
  );
}
