type BlueColors = "bg-indigo-100" | "bg-blue-100";

export interface ButtonProps {
  bgColor?: BlueColors | "bg-red-100";
}

export default function Button(props: ButtonProps) {
  return <button className={props.bgColor}>Press me!</button>;
}
