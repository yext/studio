import { TailwindClass } from "@yext/studio";

interface Props {
  className?: TailwindClass;
}

export default function CustomTailwindButton(props: Props) {
  return <button className={props.className}>PachiPachiPachi</button>;
}
