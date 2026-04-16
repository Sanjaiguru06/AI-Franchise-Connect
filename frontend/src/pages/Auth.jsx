import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Buildings, Eye, EyeSlash, ArrowRight } from '@phosphor-icons/react';

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [role, setRole] = useState(params.get('role') || 'seeker');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate(user.role === 'owner' ? '/owner/dashboard' : '/quiz'); }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        const u = await login(form.email, form.password);
        navigate(u.role === 'owner' ? '/owner/dashboard' : '/quiz');
      } else {
        const u = await register(form.name, form.email, form.password, role);
        navigate(u.role === 'owner' ? '/owner/dashboard' : '/quiz');
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8F9FA' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: '#0033A0', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 50px', minWidth: 0 }} className="auth-left">
        <Buildings size={36} color="white" weight="fill" style={{ marginBottom: 24 }} />
        <h1 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 900, color: 'white', lineHeight: 1.1, letterSpacing: '-1.5px', marginBottom: 16 }}>
          Chennai's Smartest Franchise Platform
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 40 }}>
          AI-powered matching, viability scoring, and zone intelligence — all in one platform.
        </p>
        {[
          '130+ verified franchise listings',
          'Groq AI matches you by budget & goals',
          'Chennai zone demand intelligence',
          'Plain-language franchise explainer chat',
        ].map(f => (
          <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 6, height: 6, background: '#60A5FA', flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{f}</span>
          </div>
        ))}
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          {/* Toggle */}
          <div style={{ display: 'flex', marginBottom: 32, background: '#E2E8F0', padding: 4 }}>
            {['login', 'register'].map(m => (
              <button key={m} data-testid={`auth-tab-${m}`} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '10px', background: mode === m ? 'white' : 'transparent',
                border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14,
                fontFamily: 'var(--font-body)', color: mode === m ? '#0F172A' : '#475569',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s'
              }}>{m === 'login' ? 'Sign In' : 'Create Account'}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
            {mode === 'login' ? 'Welcome back' : 'Start your journey'}
          </h2>
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 28 }}>
            {mode === 'login' ? 'Sign in to access your franchise matches.' : 'Create an account to get AI franchise recommendations.'}
          </p>

          {/* Role selector (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: 10 }}>I am a</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { v: 'seeker', l: 'Franchise Seeker', d: 'Looking to invest' },
                  { v: 'owner', l: 'Franchise Owner', d: 'Want to list my brand' },
                ].map(r => (
                  <button key={r.v} data-testid={`role-${r.v}`} onClick={() => setRole(r.v)} style={{
                    padding: '14px 12px', border: `2px solid ${role === r.v ? '#0033A0' : '#E2E8F0'}`,
                    background: role === r.v ? '#EFF6FF' : 'white', cursor: 'pointer',
                    textAlign: 'left', transition: 'all 0.2s'
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: role === r.v ? '#0033A0' : '#0F172A', marginBottom: 2 }}>{r.l}</div>
                    <div style={{ fontSize: 11, color: '#475569' }}>{r.d}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>Full Name</label>
                <input data-testid="input-name" type="text" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Arjun Kumar"
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#0033A0'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>Email</label>
              <input data-testid="input-email" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="arjun@example.com"
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#0033A0'}
                onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input data-testid="input-password" type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 6 characters"
                  style={{ width: '100%', padding: '12px 42px 12px 14px', border: '1.5px solid #E2E8F0', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none', transition: 'border 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#0033A0'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                  {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div data-testid="auth-error" style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button data-testid="auth-submit" type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '14px' }}>
              {loading ? <span className="spinner" /> : (mode === 'login' ? 'Sign In' : 'Create Account')}
              {!loading && <ArrowRight size={16} weight="bold" />}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: '#475569', marginTop: 20 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already registered? '}
            <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0033A0', fontWeight: 700, fontSize: 13 }}>
              {mode === 'login' ? 'Create one →' : 'Sign in →'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .auth-left { display: none !important; } }
      `}</style>
    </div>
  );
}
