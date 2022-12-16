export interface CardProps {
  text: string;
}

export default function Card(props: CardProps) {
  return <div>{props.text}</div>;
}
