import Banner from "./Banner";

export interface Props {
  obj?: {
    text?: string;
  };
}

export default function ModuleWithObjProps(props: Props) {
  return <Banner title={`hello ${props.obj?.text}`} />;
}
