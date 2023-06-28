interface Props {
  supportedPropType?: string[];
}

export default function ErrorComponent(_props: Props) {
  return (
    <div>
      We will still try our best to render this component even with a parsing
      error.
    </div>
  );
}
