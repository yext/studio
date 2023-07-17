import BannerRequiredProps from "../ComponentFile/BannerRequiredProps";

export default function IndexPage() {
  return (
    <BannerRequiredProps 
      title="title" 
      obj={{
        firstName: "Joe"
      }}
    />);
}