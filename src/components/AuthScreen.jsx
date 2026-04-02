import { useState } from 'react';

export default function AuthScreen({ onSignIn, onSignUp }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (isLogin) {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password, displayName);
        setSuccess('Account created! You can now log in.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 50%, #0d1117 100%)',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      overflow: 'auto',
      padding: '10px'
    }}>
      <div style={{
        background: 'rgba(26, 31, 46, 0.95)',
        border: '1px solid rgba(74, 255, 212, 0.2)',
        borderRadius: '16px',
        padding: 'clamp(16px, 3vh, 40px) clamp(16px, 3vw, 40px)',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '95dvh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(10px, 2vh, 30px)' }}>
          <span style={{ fontSize: 'clamp(28px, 5vh, 48px)' }}>⚔️</span>
          <h1 style={{
            color: '#4affd4',
            fontSize: 'clamp(18px, 3vh, 28px)',
            margin: 'clamp(4px, 1vh, 10px) 0 clamp(2px, 0.5vh, 5px)',
            textShadow: '0 0 20px rgba(74, 255, 212, 0.3)'
          }}>
            Idle Clash
          </h1>
          <p style={{ color: '#7b95a6', fontSize: 'clamp(11px, 1.5vh, 14px)', margin: 0 }}>
            {isLogin ? 'Welcome back, adventurer!' : 'Create your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#7b95a6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your adventurer name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(13, 17, 23, 0.8)',
                  border: '1px solid rgba(74, 255, 212, 0.15)',
                  borderRadius: '8px',
                  color: '#e0e6ed',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.15)'}
              />
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#7b95a6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(13, 17, 23, 0.8)',
                border: '1px solid rgba(74, 255, 212, 0.15)',
                borderRadius: '8px',
                color: '#e0e6ed',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.15)'}
            />
          </div>

          <div style={{ marginBottom: 'clamp(12px, 2vh, 24px)' }}>
            <label style={{ color: '#7b95a6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'rgba(13, 17, 23, 0.8)',
                border: '1px solid rgba(74, 255, 212, 0.15)',
                borderRadius: '8px',
                color: '#e0e6ed',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(74, 255, 212, 0.15)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255, 23, 68, 0.15)',
              border: '1px solid rgba(255, 23, 68, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#ff6b8a',
              fontSize: '13px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(74, 255, 212, 0.1)',
              border: '1px solid rgba(74, 255, 212, 0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#4affd4',
              fontSize: '13px'
            }}>
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: 'clamp(8px, 1.5vh, 14px)',
              background: loading
                ? 'rgba(74, 255, 212, 0.3)'
                : 'linear-gradient(135deg, #4affd4, #00b894)',
              border: 'none',
              borderRadius: '8px',
              color: '#0a0e17',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            {loading ? '⏳ Loading...' : isLogin ? '🔓 Login' : '📝 Register'}
          </button>
        </form>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <span
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            style={{
              color: '#4affd4',
              fontSize: '13px',
              cursor: 'pointer',
              textDecoration: 'underline',
              opacity: 0.8
            }}
          >
            {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
          </span>
        </div>
      </div>
    </div>
  );
}
