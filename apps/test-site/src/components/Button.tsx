export interface ButtonProps {
  bgColor?: "bg-indigo-100" | "bg-blue-100" | "bg-red-100";
}

export default function Button(props: ButtonProps) {
  return <button className={props.bgColor}>Press me!</button>;
}
