import { TailwindClass } from "@yext/studio";

interface Props {
  className?: TailwindClass;
}

export const initialProps: Props = { className: "" };

export default function CustomTailwindButton(props: Props) {
  return <button className={props.className}>PachiPachiPachi</button>;
}
