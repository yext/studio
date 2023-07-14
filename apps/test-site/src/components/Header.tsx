import { CSSProperties } from 'react'

const styles: CSSProperties = {
  position: 'fixed',
  top: 0,
  backgroundColor: 'turquoise'
}

const Header = () => {
  return <div style={styles}>This is a Header</div>
};

export default Header;
