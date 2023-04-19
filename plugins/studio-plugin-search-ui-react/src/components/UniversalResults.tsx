/* eslint-disable react-perf/jsx-no-new-object-as-prop */
import { UniversalResults as UnwrappedUniversalResults } from "@yext/search-ui-react";

export default function UniversalResults() {
  return (
    <UnwrappedUniversalResults
      verticalConfigMap={{
        people: {},
        products: {},
        links: {},
        KM: {},
        financial_professionals: {},
        healthcare_professionals: {},
        jobs: {},
      }}
    />
  );
}
