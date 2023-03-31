export interface ButtonProps {
  className?: string;
}

export const initialProps: ButtonProps = {
  className: "px-4",
};

export default function Button(props: ButtonProps) {
  return <button className={props.className}>{`Press me!`}</button>;
}
