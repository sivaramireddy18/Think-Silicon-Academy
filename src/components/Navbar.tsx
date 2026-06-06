import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { Cpu, BookOpen, Layers, Award, ShieldCheck, Briefcase, Terminal, MessageSquare, User, LogOut, Menu, X, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const { currentUser, logout, theme, toggleTheme } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: Cpu },
    { id: 'simulators', label: 'Simulators', icon: Terminal },
    { id: 'labs', label: 'Virtual Labs', icon: Layers },
    { id: 'validation', label: 'Validation Academy', icon: ShieldCheck },
    { id: 'placement', label: 'Placement Portal', icon: Briefcase },
  ];

  const handleNav = (viewId: string) => {
    setView(viewId);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNav('landing');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 24px',
      height: '70px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      {/* Logo */}
      <div 
        onClick={() => handleNav('landing')} 
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid var(--primary)',
          borderRadius: '8px',
          padding: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-neon)'
        }}>
          <Cpu size={22} color="var(--primary)" />
        </div>
        <div>
          <span style={{
            fontFamily: 'var(--font-header)',
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.5px'
          }}>
            THINK <span style={{ color: 'var(--primary)' }}>SILICON</span>
          </span>
          <span style={{
            display: 'block',
            fontSize: '9px',
            color: 'var(--text-secondary)',
            marginTop: '-4px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Academy
          </span>
        </div>
      </div>

      {/* Desktop Links */}
      <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                padding: '8px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                borderRadius: '4px 4px 0 0'
              }}
              className="nav-btn-hover"
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Auth Control */}
      <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%'
          }}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--primary)" />}
        </button>
        {currentUser ? (
          <>
            <button
              onClick={() => handleNav(currentUser.role === 'admin' ? 'admin' : 'lms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: 'var(--primary)'
              }}
            >
              <User size={14} />
              Dashboard ({currentUser.role})
            </button>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--error)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px'
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => handleNav('auth')}
            className="btn btn-outline"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}
          >
            Sign In / Enroll
          </button>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="mobile-only" style={{ display: 'none' }}>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '70px',
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 100
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                style={{
                  background: isActive ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            {theme === 'dark' ? <Sun size={18} color="var(--warning)" /> : <Moon size={18} color="var(--primary)" />}
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
          <hr style={{ border: '0', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />
          {currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '0 12px' }}>
                Signed in as: <strong>{currentUser.email}</strong>
              </div>
              <button
                onClick={() => handleNav(currentUser.role === 'admin' ? 'admin' : 'lms')}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start' }}
              >
                <User size={16} /> My Dashboard
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ justifyContent: 'flex-start' }}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <button onClick={() => handleNav('auth')} className="btn btn-primary">
              Sign In
            </button>
          )}
        </div>
      )}

      {/* Injection of style tags for quick media queries and navbar hover */}
      <style>{`
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
        }
        @media (max-width: 768px) {
          .mobile-only { display: block !important; }
          .desktop-only { display: none !important; }
        }
        .nav-btn-hover:hover {
          color: var(--primary) !important;
          border-bottom: 2px solid var(--primary) !important;
        }
      `}</style>
    </nav>
  );
};
