import BannerUsingArrays from "../../ComponentFile/BannerUsingArrays";

export default function IndexPage({ document }) {
  return (
    <BannerUsingArrays
      arrProp={document.services}
      typeArr={[1, document.num]}
    />
  );
}
