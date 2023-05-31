import BannerUsingArrays from "../../ComponentFile/BannerUsingArrays";

export default function IndexPage({ document }) {
  return (
    <BannerUsingArrays arrProp={document.services} typeArr={document.nums} />
  );
}
