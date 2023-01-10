import React from "react";

export interface BevComponentProps {
  text: string;
};

export const initialProps: BevComponentProps = {
  text: "bev",
};

export default function BevComponent(props: BevComponentProps) {
  return (
    <div>
      Hello {props.text},
    </div>
  )
};