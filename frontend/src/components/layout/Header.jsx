import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="site-brand">
        <span className="site-brand-mark" aria-hidden="true">WC</span>
        <div>
          <p className="site-kicker">Prof-IT4all toernooiplatform</p>
          <NavLink className="site-title" to="/">
            Wereldkampioenschap 2026
          </NavLink>
        </div>
      </div>

      <nav className="site-nav">
        <NavLink end to="/">
          Overzicht
        </NavLink>
        <NavLink to="/schedule">
          Schema
        </NavLink>
        <NavLink to="/groups">
          Groepen
        </NavLink>
        <NavLink to="/leaderboard">Ranglijst</NavLink>
        <NavLink to="/predictions">Voorspellingen</NavLink>
      </nav>

      <div className="site-actions">
        {isAuthenticated ? (
          <>
            <span className="welcome-pill">Hallo, {user.name}</span>
            <button className="button button-ghost" onClick={handleLogout}>
              Uitloggen
            </button>
          </>
        ) : (
          <>
            <NavLink className="button button-ghost" to="/login">
              Inloggen
            </NavLink>
            <NavLink className="button" to="/register">
              Registreren
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
