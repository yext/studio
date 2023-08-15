import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import AddressDisplay from "../components/AddressDisplay";
import BusinessInfo from "../components/BusinessInfo";
import Footer from "../components/Footer";
import Header from "../components/Header";
import HoursDisplay from "../components/HoursDisplay";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-LocationPage",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["address", "hours", "slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return `${document.slug}`;
};

export default function LocationPage({ document }: TemplateProps) {
  return (
    <>
      <Footer copyrightText="© 2023 Yext" backgroundColor="#BAD8FD" />
      <Header
        title="Yext"
        logo="https://a.mktgcdn.com/p/R9FjcYjRNA5dAespqgHFLMvu2m18-E5Apnb3KON0oJY/300x300.png"
        backgroundColor="#BAD8FD"
      />
      <BusinessInfo>
        <AddressDisplay
          line1={`${document.address.line1}`}
          city={`${document.address.city}`}
          region={`${document.address.region}`}
          postalCode={`${document.address.postalCode}`}
          countryCode=""
        />
        <HoursDisplay
          monday={{
            isClosed: false,
            openIntervals: document.hours.monday.openIntervals,
          }}
          tuesday={{
            isClosed: false,
            openIntervals: document.hours.tuesday.openIntervals,
          }}
          wednesday={{
            isClosed: false,
            openIntervals: document.hours.wednesday.openIntervals,
          }}
        />
      </BusinessInfo>
    </>
  );
}
