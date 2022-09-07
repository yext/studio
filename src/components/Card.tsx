import { ReactNode } from 'react';
import { HexColor } from '../../studio/types';

export interface CardProps {
  bgColor?: HexColor
  children?: ReactNode
}

export default function Card(props: CardProps) {
  return (
    <div style={{backgroundColor: props.bgColor}}>
      hi this is a card
      {props.children}
    </div>
  )
}