export interface FooterProps {
  message?: string
}

export const globalProps: FooterProps = {
  message: 'default footer',
}

export default function Footer({ message }: FooterProps) {
  return <div>Footer: {message}</div>
}
