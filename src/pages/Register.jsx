import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 6, color: 'var(--blue)' }}>PEX</h1>
        <p style={{ textAlign: 'center', color: 'var(--text2)', marginBottom: 28 }}>
          Create account — you'll start with $10,000
        </p>

        <div className="card">
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 5 }}>Username</label>
              <input name="username" value={form.username} onChange={handle} required autoFocus />
            </div>
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 5 }}>Email</label>
              <input name="email" type="email" value={form.email} onChange={handle} required />
            </div>
            <div>
              <label className="muted" style={{ display: 'block', marginBottom: 5 }}>Password</label>
              <input name="password" type="password" value={form.password} onChange={handle} required />
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 16, color: 'var(--text2)', fontSize: 13 }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
