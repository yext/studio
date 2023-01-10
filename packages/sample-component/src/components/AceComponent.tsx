import React from "react";

export interface AceComponentProps {
  text: string;
};

export const initialProps: AceComponentProps = {
  text: "ace",
};

export default function AceComponent(props: AceComponentProps) {
  return (
    <div>
      Hello {props.text},
    </div>
  )
};