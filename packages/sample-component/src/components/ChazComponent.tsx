import React from "react";

export interface ChazComponentProps {
  text: string;
};

export const initialProps: ChazComponentProps = {
  text: "chaz",
};

export default function ChazComponent(props: ChazComponentProps) {
  return (
    <div>
      Hello {props.text},
    </div>
  )
};