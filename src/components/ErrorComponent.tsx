interface Props {
  /** Arbitrary records are currently unsupported and result in a parsing error */
  unsupportedPropType?: Record<string, string[]>;
}

export default function ErrorComponent(_props: Props) {
  return (
    <div>
      We will still try our best to render this component even with a parsing
      error.
    </div>
  );
}
