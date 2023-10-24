import "../styles/index.css";
import ComplexBanner from "../ComponentFile/ComplexBanner";
import "@yext/search-ui-react/index.css";

export default function Test() {
  return (
    <>
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <ComplexBanner title="three" num={3} bool={false} />
    </>
  );
}
