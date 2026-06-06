import React, { useState } from 'react';
import { useAppData, User } from '../../context/AppDataContext';
import { Shield, Mail, Key, Sparkles, UserCheck } from 'lucide-react';

interface AuthViewProps {
  setView: (view: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ setView }) => {
  const { login } = useAppData();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<User['role']>('student');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    const success = login(email, role);
    if (success) {
      setView(role === 'admin' ? 'admin' : 'lms');
    }
  };

  const handleQuickLogin = (quickEmail: string, quickRole: User['role']) => {
    login(quickEmail, quickRole);
    setView(quickRole === 'admin' ? 'admin' : 'lms');
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', flexDirection: 'column', gap: '30px', padding: '60px 20px' }}>
      <div className="glass-card" style={{ maxWidth: '450px', width: '100%', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          padding: '12px',
          borderRadius: '50%',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          border: '1px solid var(--primary)',
          marginBottom: '20px',
          boxShadow: 'var(--shadow-neon)'
        }}>
          <Shield size={32} color="var(--primary)" />
        </div>
        
        <h2 style={{ fontSize: '26px', marginBottom: '8px' }}>Sign in to Portal</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>
          Access your personalized learning, simulation, and validation ecosystem.
        </p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--error)',
            color: 'var(--error)',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '15px' }} />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                className="form-input"
                style={{ width: '100%', paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Portal Role Access</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value as User['role'])}
              className="form-input"
              style={{ width: '100%', backgroundColor: 'var(--bg-input)' }}
            >
              <option value="student">Student Learner Dashboard</option>
              <option value="trainer">Academy Instructor Panel</option>
              <option value="placement">Placement Team Portal</option>
              <option value="admin">Super Administrator Portal</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
            Enter Portal
          </button>
        </form>

        <div style={{ margin: '24px 0 16px 0', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: '1px solid var(--border-color)', zIndex: 1 }} />
          <span style={{
            position: 'relative',
            zIndex: 2,
            backgroundColor: 'var(--bg-card)',
            padding: '0 12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            OR QUICK BYPASS FOR AUDITING
          </span>
        </div>

        {/* Quick Roles Bypass */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={() => handleQuickLogin('student@thinksilicon.com', 'student')}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <Sparkles size={14} color="var(--primary)" />
            <span>As Student</span>
          </button>
          <button
            onClick={() => handleQuickLogin('trainer@thinksilicon.com', 'trainer')}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <UserCheck size={14} color="var(--success)" />
            <span>As Instructor</span>
          </button>
          <button
            onClick={() => handleQuickLogin('placement@thinksilicon.com', 'placement')}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <Key size={14} color="var(--warning)" />
            <span>As Placement</span>
          </button>
          <button
            onClick={() => handleQuickLogin('admin@thinksilicon.com', 'admin')}
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <Shield size={14} color="var(--error)" />
            <span>As Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
