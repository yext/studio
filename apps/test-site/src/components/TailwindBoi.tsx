import { TailwindClass } from "@yext/studio";

export interface Proppers {
  boi?: TailwindClass;
}

export default function TailwindBoi({ boi }: Proppers) {
  return (
    <div className={boi}>
      hiya
    </div>
  );
}
