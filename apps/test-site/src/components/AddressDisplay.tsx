import { Address } from "@yext/types";

export default function AddressDisplay(props: Address) {
  return (
    <div className="flex flex-col text-2xl">
      <span>{props.line1}</span>
      <span>
        {props.city}, {props.region} {props.postalCode}
      </span>
    </div>
  );
}
