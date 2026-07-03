import React from 'react';
import { useAuth } from '../context/AuthContext';
import AlertCenter from './AlertCenter';
import { LogOut, GraduationCap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-brand">
        <GraduationCap size={28} style={{ color: 'var(--border-focus)' }} />
        <span>Vardhaman CSE</span>
        <span style={{ fontSize: '0.85rem', fontWeight: 500, opacity: 0.5, borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '0.5rem', marginLeft: '0.2rem' }}>Summer Proj</span>
      </div>

      <div className="nav-links">
        {user && (
          <>
            <div className="nav-user">
              <div className="avatar-badge" title={user.name}>
                {getInitials(user.name)}
              </div>
              <span style={{ fontWeight: 500 }}>{user.name}</span>
            </div>

            <AlertCenter />

            <button 
              className="btn btn-secondary btn-icon-only" 
              onClick={logout} 
              title="Logout session"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
