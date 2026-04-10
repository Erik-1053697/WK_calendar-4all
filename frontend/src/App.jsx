import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell.jsx';
import ProtectedRoute from './components/ui/ProtectedRoute.jsx';
import GroupsPage from './pages/GroupsPage.jsx';
import LeaderboardPage from './pages/LeaderboardPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import PredictionsPage from './pages/PredictionsPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<SchedulePage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route
          path="/predictions"
          element={
            <ProtectedRoute>
              <PredictionsPage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
