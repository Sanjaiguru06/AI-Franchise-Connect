import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { List, X, Buildings, MagnifyingGlass, UserCircle, SignOut, ChartBar, PlusCircle } from '@phosphor-icons/react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = user?.role === 'owner'
    ? [
        { to: '/owner/dashboard', label: 'Dashboard' },
        { to: '/owner/add', label: 'List Franchise' },
        { to: '/browse', label: 'Browse' },
      ]
    : [
        { to: '/browse', label: 'Browse' },
        { to: '/quiz', label: 'Find Match' },
        { to: '/location', label: 'Zone Intel' },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #E2E8F0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: '#0033A0',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Buildings size={20} color="white" weight="fill" />
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: '#0F172A', letterSpacing: '-0.5px' }}>
            FranchiseIQ
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              textDecoration: 'none', padding: '8px 16px',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14,
              color: isActive(l.to) ? '#0033A0' : '#475569',
              borderBottom: isActive(l.to) ? '2px solid #0033A0' : '2px solid transparent',
              transition: 'all 0.2s'
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                data-testid="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: '1px solid #E2E8F0',
                  padding: '8px 14px', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: 14
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#0033A0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 700
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.name?.split(' ')[0]}
              </button>
              {profileOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                  background: 'white', border: '1px solid #E2E8F0',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 200, zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{user.email}</div>
                    <div style={{ fontSize: 11, color: '#0033A0', fontWeight: 600, textTransform: 'uppercase', marginTop: 4, letterSpacing: '0.1em' }}>{user.role}</div>
                  </div>
                  {user.role === 'owner' && (
                    <>
                      <button onClick={() => { navigate('/owner/dashboard'); setProfileOpen(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ChartBar size={16} /> Dashboard
                      </button>
                      <button onClick={() => { navigate('/owner/add'); setProfileOpen(false); }} style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlusCircle size={16} /> List Franchise
                      </button>
                    </>
                  )}
                  <button onClick={handleLogout} data-testid="logout-btn" style={{ width: '100%', padding: '10px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 14, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #E2E8F0' }}>
                    <SignOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/auth" style={{ textDecoration: 'none' }}>
                <button style={{ background: 'none', border: '1.5px solid #0F172A', padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Login</button>
              </Link>
              <Link to="/auth?mode=register" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" data-testid="get-started-btn" style={{ padding: '9px 20px', fontSize: 14 }}>Get Started</button>
              </Link>
            </>
          )}
          <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none' }} className="mobile-menu-btn">
            {open ? <X size={24} /> : <List size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '16px 24px', background: 'white' }}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} style={{ display: 'block', padding: '10px 0', textDecoration: 'none', color: '#0F172A', fontWeight: 500 }}>{l.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
