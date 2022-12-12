import React from "react";
import ComplexBanner from "../ComponentFile/ComplexBanner";

export default function IndexPage() {
  return (
    <React.Fragment>
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <ComplexBanner title="three" num={3} bool={false} />
    </React.Fragment>
  );
}
