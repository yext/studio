import { MissingImportProps } from "../StudioSourceFileParser/exportedTypes";

export default function MissingExternalImportBanner(props: MissingImportProps) {
  return <div style={{ backgroundColor: props.color }}></div>;
}
