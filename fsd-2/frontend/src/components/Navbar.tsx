import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getRole, clearAuth } from '../utils/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const role = getRole();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  return (
    <nav className="navbar" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem',
      width: '100%'
    }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#4f46e5' }}>
        EventAura
      </Link>
      
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/communities" className="nav-link">Communities</Link>
        <Link to="/events" className="nav-link">Events</Link>
        {role !== 'admin' && (
          <Link to="/leaderboard" className="nav-link">Leaderboard</Link>
        )}
        
        {authenticated ? (
          <>
            <Link to="/profile" className="nav-link">Profile</Link>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;