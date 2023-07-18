import BannerRequiredProps from "../ComponentFile/BannerRequiredProps";

export default function IndexPage() {
  return (
    <BannerRequiredProps
      title="title"
      intervals={[
        {
          start: "01:00",
        },
      ]}
    />
  );
}
