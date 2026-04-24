import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/predictions');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat().join(' ') ||
          'Inloggen is niet gelukt.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Welkom terug</p>
        <h1>Log in om je voorspellingen op te slaan</h1>

        <label>
          <span>E-mail</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            required
          />
        </label>

        <label>
          <span>Wachtwoord</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            required
          />
        </label>

        {error ? <p className="form-message error">{error}</p> : null}

        <button className="button" disabled={busy} type="submit">
          {busy ? 'Inloggen...' : 'Inloggen'}
        </button>

        <p className="muted">
          Nog geen account? <Link to="/register">Maak een account aan</Link>
        </p>
      </form>
    </section>
  );
}
