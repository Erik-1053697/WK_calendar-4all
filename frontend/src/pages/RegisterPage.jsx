import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await register(form);
      navigate('/');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat().join(' ') ||
          'Unable to register.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Create account</p>
        <h1>Start predicting the 2026 tournament</h1>

        <label>
          <span>Name</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>

        <label>
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        <label>
          <span>Confirm password</span>
          <input
            type="password"
            value={form.password_confirmation}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password_confirmation: event.target.value,
              }))
            }
            required
          />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}

        <button className="button" disabled={busy} type="submit">
          {busy ? 'Creating account...' : 'Register'}
        </button>

        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </section>
  );
}
