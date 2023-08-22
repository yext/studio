import { TailwindClass } from "@yext/studio";

export interface Proppers {
  boi?: TailwindClass;
  hi?: string
}

export default function TailwindBoi({ boi }: Proppers) {
  return (
    <div className={boi}>
      {boi}
    </div>
  );
}
