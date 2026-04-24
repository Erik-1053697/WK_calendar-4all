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
      navigate('/predictions');
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          Object.values(requestError.response?.data?.errors || {}).flat().join(' ') ||
          'Registreren is niet gelukt.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <form className="auth-card panel" onSubmit={handleSubmit}>
        <p className="eyebrow">Account aanmaken</p>
        <h1>Start met voorspellen voor het toernooi van 2026</h1>

        <label>
          <span>Naam</span>
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            required
          />
        </label>

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

        <label>
          <span>Bevestig wachtwoord</span>
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
          {busy ? 'Account aanmaken...' : 'Registreren'}
        </button>

        <p className="muted">
          Heb je al een account? <Link to="/login">Inloggen</Link>
        </p>
      </form>
    </section>
  );
}
