import Banner from "./Banner";

export interface PanelProps {
  text?: string,
}

export default function Panel(props: PanelProps) {
  return <>
    {props.text}
    <Banner title="This is Banner"/>
    <button>This is button</button>
  </>;
}
