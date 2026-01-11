import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../components';

const HamburgerButton = ({ isOpen, onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white'
      }}
    >
      <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
    </Button>
  );
};

export default HamburgerButton;