import BannerComponent from "../components/BannerComponent";

export default function BannerModule() {
  return (
    <>
      <BannerComponent bannerText="first Banner" />
      <BannerComponent />
    </>
  );
}
