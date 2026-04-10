import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

function rankClass(position, enabled = true) {
  if (!enabled) {
    return '';
  }

  return {
    1: 'is-gold',
    2: 'is-silver',
    3: 'is-bronze',
  }[position] ?? '';
}

export default function LeaderboardPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/groups/standings');
        setGroups(response.data.data);
      } catch (requestError) {
        setError('We could not load the leaderboard.');
        console.error(requestError);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  const leaderboard = useMemo(() => {
    const teams = groups.flatMap((group) =>
      group.standings.map((team) => ({
        ...team,
        group_code: group.code,
        group_name: group.name,
        group_position: team.position,
      })),
    );

    const hasAnyPoints = teams.some((team) => team.points > 0 || team.played > 0);

    const sorted = [...teams].sort((left, right) => {
      if (hasAnyPoints) {
        return (right.points - left.points)
          || (right.goal_difference - left.goal_difference)
          || (right.goals_for - left.goals_for)
          || (left.goals_against - right.goals_against)
          || left.group_code.localeCompare(right.group_code)
          || left.group_position - right.group_position
          || left.team_name.localeCompare(right.team_name);
      }

      return left.group_code.localeCompare(right.group_code)
        || left.group_position - right.group_position
        || left.team_name.localeCompare(right.team_name);
    });

    return {
      hasAnyPoints,
      teams: sorted.reduce((rows, team, index) => {
        if (!hasAnyPoints) {
          rows.push({
            ...team,
            overall_position: 1,
          });

          return rows;
        }

        const previousTeam = sorted[index - 1];
        const previousRow = rows[index - 1];
        const overallPosition = index === 0
          ? 1
          : (team.points === previousTeam.points ? previousRow.overall_position : index + 1);

        rows.push({
          ...team,
          overall_position: overallPosition,
        });

        return rows;
      }, []),
    };
  }, [groups]);

  return (
    <section className="leaderboard-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Leaderboard</p>
          <h2>All teams ranking</h2>
        </div>
        <p className="muted">
          {leaderboard.hasAnyPoints
            ? 'Teams are ranked by stored points. Teams with the same points share the same position.'
            : 'No results yet, so every team still shares 1st place and stays in group order.'}
        </p>
      </div>

      {loading ? <div className="panel loading-panel">Loading leaderboard...</div> : null}
      {error ? <div className="panel form-message error">{error}</div> : null}

      {!loading && !error ? (
        <section className="leaderboard-table panel">
          <div className="leaderboard-row leaderboard-row--head">
            <span>Rank</span>
            <span>Team</span>
            <span>Group</span>
            <span>P</span>
            <span>GD</span>
            <span>Pts</span>
          </div>

          {leaderboard.teams.map((team) => (
            <div className={`leaderboard-row ${rankClass(team.overall_position, leaderboard.hasAnyPoints)}`} key={team.team_id}>
              <span className={`leaderboard-rank ${rankClass(team.overall_position, leaderboard.hasAnyPoints)}`}>
                {leaderboard.hasAnyPoints ? team.overall_position : 1}
              </span>
              <div className="leaderboard-team">
                <strong>{team.team_name}</strong>
                <small>{team.group_slot || team.fifa_code || 'TBD'}</small>
              </div>
              <span className="leaderboard-group">{team.group_name}</span>
              <span>{team.played}</span>
              <span>{team.goal_difference > 0 ? `+${team.goal_difference}` : team.goal_difference}</span>
              <span className={`leaderboard-points ${team.points > 0 ? 'is-active' : ''}`}>
                {team.points}
              </span>
            </div>
          ))}
        </section>
      ) : null}
    </section>
  );
}
