export interface ButtonProps {
  className?: string;
}

export const initialProps: ButtonProps = {
  className: "px-2",
};

export default function Button(props: ButtonProps) {
  return <button className={props.className}>{`Press me!`}</button>;
}
