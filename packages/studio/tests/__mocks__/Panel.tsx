import Banner from "./Banner";

export interface PanelProps {
  text?: string;
}

export default function Panel(props: PanelProps) {
  return (
    <>
      <Banner title={props.text} />
      <Banner title="This is Banner" />
    </>
  );
}
