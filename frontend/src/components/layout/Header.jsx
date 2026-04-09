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
      <div>
        <p className="site-kicker">FIFA World Cup 2026</p>
        <NavLink className="site-title" to="/">
          World Cup Planner
        </NavLink>
      </div>

      <nav className="site-nav">
        <NavLink to="/">Schedule</NavLink>
        {isAuthenticated ? <NavLink to="/predictions">My Picks</NavLink> : null}
      </nav>

      <div className="site-actions">
        {isAuthenticated ? (
          <>
            <span className="welcome-pill">Hi, {user.name}</span>
            <button className="button button-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink className="button button-ghost" to="/login">
              Log in
            </NavLink>
            <NavLink className="button" to="/register">
              Register
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
