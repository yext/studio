export interface ButtonProps {
  className?: string;
}

export const initialProps: ButtonProps = {
  className: "px-4 py-2 text-lg border-4 border-green-500",
};

export default function Button(props: ButtonProps) {
  return <button className={props.className}>Press me!</button>;
}
