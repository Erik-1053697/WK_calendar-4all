import { displayTeamName, teamSlot } from '../../lib/domain';

export default function TeamMatchup({ match, compact = false }) {
  return (
    <div className={`team-matchup${compact ? ' team-matchup--compact' : ''}`}>
      <div>
        <span>{teamSlot(match, 'home')}</span>
        <strong>{displayTeamName(match.home_team_name)}</strong>
      </div>
      <em>vs</em>
      <div>
        <span>{teamSlot(match, 'away')}</span>
        <strong>{displayTeamName(match.away_team_name)}</strong>
      </div>
    </div>
  );
}
