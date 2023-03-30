export interface ButtonProps {
  id?: string;
}

export const initialProps: ButtonProps = {
  id: "bar",
};

export default function Button(props: ButtonProps) {
  return <button id={props.id}>{`Press me!`}</button>;
}
