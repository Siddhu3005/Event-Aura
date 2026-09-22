import React from 'react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex'
    }}>
      <div style={{
        width: '280px',
        backgroundColor: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        height: '100%',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.5rem',
              cursor: 'pointer',
              float: 'right'
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
      <div style={{ flex: 1 }} onClick={onClose} />
    </div>
  );
};

export default MobileMenu;