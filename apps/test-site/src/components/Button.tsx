export interface ButtonProps {
  bgColors: "bg-indigo-100" | "bg-blue-100" | "bg-red-100";
}

export default function Button(props: ButtonProps) {
  return <button className={props.bgColors}>Press me!</button>;
}
