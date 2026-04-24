import { useEffect, useMemo, useState } from 'react';
import GroupStandingsGrid from '../components/groups/GroupStandingsGrid';
import PredictionLeaderboard from '../components/leaderboard/PredictionLeaderboard';
import MetricCard from '../components/ui/MetricCard';
import PageHeader from '../components/ui/PageHeader';
import { getGroups, getLeaderboard } from '../services/tournamentApi';

export default function GroupsPage() {
  const [groups, setGroups] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadGroups() {
      setLoading(true);
      setError('');

      try {
        const [groupData, leaderboardData] = await Promise.all([getGroups(), getLeaderboard()]);
        setGroups(groupData);
        setLeaderboard(leaderboardData.entries);
      } catch (requestError) {
        setError('We konden de groepen en ranglijst niet laden.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    loadGroups();
  }, []);

  const stats = useMemo(() => {
    const teams = groups.flatMap((group) => group.standings);

    return {
      groups: groups.length,
      teams: teams.length,
      qualified: teams.filter((team) => team.qualification_status === 'qualified').length,
      undecided: teams.filter((team) => team.qualification_status === 'undecided').length,
    };
  }, [groups]);

  return (
    <section className="screen-stack">
      <PageHeader
        eyebrow="Groepen en ranglijst"
        title="Groepsstanden en voorspellers"
        subtitle="Automatisch bijgewerkte groepsstanden met kwalificatiestatus en de ranglijst van voorspellingen."
      />

      <section className="metric-grid">
        <MetricCard label="Groepen" value={stats.groups} detail="Toernooipoules" />
        <MetricCard label="Teams" value={stats.teams} detail="Ingelote teams" tone="blue" />
        <MetricCard label="Geplaatst" value={stats.qualified} detail="Vaststaande posities" tone="gold" />
        <MetricCard label="Onbeslist" value={stats.undecided} detail="Nog open" />
      </section>

      {loading ? <div className="loading-shell">Groepsstanden laden...</div> : null}
      {error ? <div className="empty-card">{error}</div> : null}

      {!loading && !error ? (
        <section className="groups-leaderboard-layout">
          <GroupStandingsGrid groups={groups} />
          <PredictionLeaderboard entries={leaderboard} />
        </section>
      ) : null}
    </section>
  );
}
