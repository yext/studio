import { CSSProperties } from "react";

const styles: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  backgroundColor: "turquoise",
};

const FixedText = () => {
  return <div style={styles}>This is text fixed to the top right corner</div>;
};

export default FixedText;
