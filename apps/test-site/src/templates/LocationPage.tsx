import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Address from "../components/Address";
import BusinessInfo from "../components/BusinessInfo";
import Header from "../components/Header";
import HoursDisplay from "../components/HoursDisplay";
import ProminentImage from "../components/ProminentImage";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `${document.slug}`;
};

export default function LocationPage() {
  return (
    <>
      <Header
        title="Yext"
        logo="https://a.mktgcdn.com/p/R9FjcYjRNA5dAespqgHFLMvu2m18-E5Apnb3KON0oJY/300x300.png"
        backgroundColor="#BAD8FD"
      />
      <ProminentImage src="https://images.ctfassets.net/n2ifzifcqscw/10wJSHT2Zvj5G1Z3GYHUqv/882e93cefece92d25d25933d56598903/telluride_shutterstock_2074692298.jpg" />
      <BusinessInfo>
        <Address
          line1="110 Founders Ave"
          city="Falls Church"
          region="VA"
          postalCode="22046"
          countryCode=""
        />
        <HoursDisplay
          monday={{
            isClosed: false,
            openIntervals: [
              { start: `9:00 AM`, end: `11:00 AM` },
              { start: `12:00 PM`, end: `5:00 PM` },
            ],
          }}
          tuesday={{
            isClosed: false,
            openIntervals: [{ start: `9:00 AM`, end: `5:00 PM` }],
          }}
          thursday={{
            isClosed: false,
            openIntervals: [
              { start: `9:00 AM`, end: `11:00 AM` },
              { start: `12:00 PM`, end: `2:00 PM` },
              { start: `4:00 PM`, end: `5:00 PM` },
            ],
          }}
        />
      </BusinessInfo>
    </>
  );
}
