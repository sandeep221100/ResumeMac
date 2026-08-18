import { useState, type FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';

import '../styles/login.css';
import type { StaticPageId } from './StaticPages';

function Logo() {
  return (
    <a className="logo" href="#top">
      <b>↗</b>Resume<span>Redefined</span>
    </a>
  );
}

export default function LoginPage({
  onSuccess,
  onBack,
  onNavigate,
}: {
  onSuccess: () => void;
  onBack: () => void;
  onNavigate?: (page: StaticPageId) => void;
}) {
  const { login, signup, loading, error, clearError } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (mode === 'signup') {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onSuccess();
    } catch {
      // error is set by auth context
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    clearError();
  };

  return (
    <div className="login-page graph-canvas">
      <main>
        <nav className="nav container" id="top">
          <div className="nav-logo-row">
            <Logo />
          </div>
          <div className="nav-row">
            <a className="save-login" href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>
              &larr; BACK TO HOME
            </a>
          </div>
        </nav>

        <section className="auth-section container">
          <div className="auth-card">
            <p className="kicker" style={{ textAlign: 'center' }}>&mdash; {mode === 'login' ? 'WELCOME BACK' : 'CREATE YOUR ACCOUNT'}</p>
            <h1>
              {mode === 'login' ? 'Log in to Resume Redefined' : 'Sign up for Resume Redefined'}
            </h1>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">EMAIL ADDRESS</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">PASSWORD</label>
                <input
                  id="password"
                  className="form-input"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'}
                />
              </div>

              <button
                type="submit"
                className="button"
                disabled={loading}
              >
                {loading ? 'Please wait…' : mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
              </button>
            </form>

            <p className="mode-switch">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchMode(); }}>
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </a>
            </p>
          </div>
        </section>

        <footer className="site-footer container">
          <div className="footer-top">
            <div className="footer-brand">
              <Logo />
              <p>Build your career story with intention — one profile, every application.</p>
            </div>
            <div className="footer-col">
              <h4>PRODUCT</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onBack(); }}>Resume Builder</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('how-it-works'); }}>How It Works</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>COMPANY</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('about-us'); }}>About Us</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('contact'); }}>Contact</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>RESOURCES</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('resume-tips'); }}>Resume Tips</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('ats-resume-guide'); }}>ATS Resume Guide</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>LEGAL</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('privacy-policy'); }}>Privacy Policy</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('terms-of-service'); }}>Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <small>© 2026 Resume Redefined</small>
            <a href="mailto:resumeredefined@gmail.com">resumeredefined@gmail.com</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
