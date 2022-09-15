import { ReactNode } from 'react';
import { HexColor } from '../../studio/types';

export interface CardProps {
  bgColor?: HexColor
  text?: string
  children?: ReactNode
}

export default function Card(props: CardProps) {
  return (
    <div style={{
      backgroundColor: props.bgColor,
      border: '8px ridge rgba(211, 220, 50, .6)'
    }}>
      hi this is a card
      {props.text}
      {props.children}
    </div>
  )
}