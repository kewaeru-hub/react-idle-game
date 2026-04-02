import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useAuth } from './hooks/useAuth.js'
import AuthScreen from './components/AuthScreen.jsx'

// Register Service Worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration);
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  });
}

function Root() {
  const { user, loading: authLoading, signUp, signIn, signOut } = useAuth();

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0e17', color: '#4affd4', fontSize: '24px' }}>
        <span style={{ fontSize: '48px', marginRight: '16px' }}>⚔️</span> Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  }

  // key={user.id} forces React to completely destroy and re-create App
  // when a different user logs in — all state, refs, timers are fresh
  return <App key={user.id} user={user} signOut={signOut} />;
}

createRoot(document.getElementById('root')).render(
  <Root />
)

