import React from "react";
import ComplexBanner from "../ComponentFile/ComplexBanner";

function renderFunction() {
  return (
    <>
      <ComplexBanner title="first!" num={1} />
      <ComplexBanner />
      <ComplexBanner title="three" num={3} bool={false} />
    </>
  );
}

export default {
  render: renderFunction
} as React.Component;
