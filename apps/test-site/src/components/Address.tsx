export interface AddressProps {
  line1: string;
  city: string;
  /** Location's State */
  region: string;
  postalCode: string;
  countryCode: string;
}

export default function Address(props: AddressProps) {
  return (
    <div className="flex flex-col text-2xl">
      <span>{props.line1}</span>
      <span>
        {props.city}, {props.region} {props.postalCode}
      </span>
    </div>
  );
}
