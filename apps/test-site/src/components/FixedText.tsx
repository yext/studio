typescript
import { CSSProperties } from "react";

const styles: CSSProperties = {
  position: "fixed",
  top: 0,
  right: 0,
  backgroundColor: "green",
};

const FixedText = () => {
  return <div style={styles}></div>;
};

export default FixedText;
