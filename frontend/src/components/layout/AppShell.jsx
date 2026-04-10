import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';

export default function AppShell() {
  const location = useLocation();
  const isScheduleRoute = location.pathname === '/';

  return (
    <div className={`app-shell${isScheduleRoute ? ' app-shell--schedule' : ''}`}>
      <Header />
      <main className={`app-main${isScheduleRoute ? ' app-main--schedule' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
