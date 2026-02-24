// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <div style={styles.card}>

        <div style={styles.wordmark}>
          <span style={styles.wordmarkDot} />
          <span style={styles.wordmarkText}>Propty</span>
        </div>

        <h1 style={styles.heading}>Admin Console</h1>
        <p style={styles.sub}>Sign in to manage your platform</p>

        <form onSubmit={submit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={form.username}
              onChange={handle}
              style={styles.input}
              placeholder="admin"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handle}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={styles.footer}>
          Propty Cameroon &mdash; Internal use only
        </p>
      </div>
    </div>
  );
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fafafa',
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  card: {
    width: '100%',
    maxWidth: 380,
    padding: '48px 40px 36px',
    background: '#fff',
    border: '1px solid #e5e5e5',
    borderRadius: 4,
  },
  wordmark: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  wordmarkDot: {
    display: 'block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#111',
  },
  wordmarkText: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '0.04em',
    color: '#111',
    fontFamily: "'Georgia', serif",
  },
  heading: {
    margin: '0 0 6px',
    fontSize: 22,
    fontWeight: 400,
    color: '#111',
    letterSpacing: '-0.01em',
  },
  sub: {
    margin: '0 0 28px',
    fontSize: 13,
    color: '#888',
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#555',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  input: {
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #ddd',
    borderRadius: 3,
    outline: 'none',
    color: '#111',
    background: '#fff',
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  error: {
    margin: 0,
    fontSize: 13,
    color: '#c0392b',
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  btn: {
    marginTop: 4,
    padding: '11px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    background: '#111',
    border: 'none',
    borderRadius: 3,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  btnDisabled: {
    background: '#999',
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: 28,
    fontSize: 11,
    color: '#bbb',
    textAlign: 'center',
    fontFamily: "'Helvetica Neue', sans-serif",
    letterSpacing: '0.02em',
  },
};