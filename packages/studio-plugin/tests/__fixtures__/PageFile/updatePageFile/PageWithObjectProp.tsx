import BannerUsingObject from "../../ComponentFile/BannerUsingObject";

export default function IndexPage({ document }) {
  return (
    <BannerUsingObject
      objProp={{
        title: 'double quote -> " ',
        subtitle: "the subtitle",
        templateString: `Hello ${document.world}`,
        expression: document.name,
      }}
    />
  );
}
