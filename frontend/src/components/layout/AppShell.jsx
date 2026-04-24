import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';

export default function AppShell() {
  const location = useLocation();
  const isWideRoute = ['/', '/schedule', '/groups', '/leaderboard', '/predictions'].includes(location.pathname);

  return (
    <div className={`app-shell${isWideRoute ? ' app-shell--wide' : ''}`}>
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
