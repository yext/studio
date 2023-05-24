import BannerUsingObject from "../../ComponentFile/BannerUsingObject";

export default function IndexPage({ document }) {
  return (
    <BannerUsingObject
      objProp={{
        title: "-objProp.title-",
        templateString: `Hello ${document.world}`,
      }}
    />
  );
}
