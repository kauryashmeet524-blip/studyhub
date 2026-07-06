import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get initials from user's name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SH';

  const navLinks = [
    { name: 'Notes Hub', path: '/notes', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'DSA Practice', path: '/dsa', icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
    { name: 'Roadmap', path: '/roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L16 4m0 13V4m0 0L9 7' },
    { name: 'Revision Cards', path: '/revision', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 1121 12h-4.5' },
    { name: 'Mistakes Log', path: '/mistakes', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fdfcfd 0%, #ede8f5 100%)', padding: '24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, #6852cc 0%, #8675d6 100%)',
          borderRadius: '16px', padding: '20px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 10px 25px -5px rgba(104, 82, 204, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <svg width="36" height="36" fill="none" stroke="#ffffff" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <span style={{ fontSize: '2rem', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.03em' }}>StudyHub</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>{user?.name}</span>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '700', fontSize: '0.9rem', backdropFilter: 'blur(4px)', cursor: 'pointer'
            }} onClick={handleLogout} title="Click to logout">
              {initials}
            </div>
          </div>
        </div>

        {/* NAV */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 24px', border: '1px solid rgba(134, 117, 214, 0.15)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <Link to="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', padding: '12px 24px', borderRadius: '12px', textDecoration: 'none', background: isActive('/dashboard') ? '#f5f2fa' : 'transparent', color: isActive('/dashboard') ? '#6852cc' : '#6b7280', border: isActive('/dashboard') ? '1px solid rgba(104, 82, 204, 0.2)' : '1px solid transparent' }}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span style={{ fontSize: '1.1rem', fontWeight: '700' }}>Dashboard Overview</span>
            </Link>
          </div>

          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid rgba(134, 117, 214, 0.15)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {navLinks.map((link, index) => {
                const active = isActive(link.path);
                return (
                  <React.Fragment key={link.path}>
                    {index > 0 && <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />}
                    <li style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ color: active ? '#6852cc' : '#d1d5db', fontSize: '1.3rem', userSelect: 'none' }}>•</span>
                      <Link to={link.path} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderRadius: '10px', textDecoration: 'none', flexGrow: 1, background: active ? '#f5f2fa' : 'transparent', color: active ? '#6852cc' : '#4b5563', transition: 'all 0.15s ease' }}>
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={link.icon}></path>
                        </svg>
                        <span style={{ fontSize: '1rem', fontWeight: active ? '700' : '500' }}>{link.name}</span>
                      </Link>
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <main style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)', border: '1px solid rgba(243, 244, 246, 0.9)', minHeight: '450px' }}>
          {children}
        </main>

      </div>
    </div>
  );
}